import path from 'node:path'

import SwaggerParser from '@apidevtools/swagger-parser'
import type { InternalAxiosRequestConfig } from 'axios'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { handleMockRequest, resetMockDb } from '../../src/mocks/mock-server'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type OpenApiSchema = {
    $ref?: string
    type?: string
    nullable?: boolean
    enum?: unknown[]
    required?: string[]
    properties?: Record<string, OpenApiSchema>
    items?: OpenApiSchema
    allOf?: OpenApiSchema[]
    oneOf?: OpenApiSchema[]
    additionalProperties?: boolean | OpenApiSchema
}

let spec: any

const contractPath = path.resolve(process.cwd(), '../../../docs/openapi/miaoma-docs-mock-openapi.yaml')

const request = async (
    method: HttpMethod,
    url: string,
    options?: {
        token?: string
        data?: Record<string, unknown>
        params?: Record<string, string | number | boolean>
    }
) => {
    const config = {
        method,
        url,
        headers: options?.token ? { Authorization: `Bearer ${options.token}` } : {},
        data: options?.data,
        params: options?.params,
    } as InternalAxiosRequestConfig
    return await handleMockRequest(config)
}

const getSchemaByRef = (ref: string): OpenApiSchema => {
    const prefix = '#/components/schemas/'
    if (!ref.startsWith(prefix)) {
        throw new Error(`unsupported schema ref: ${ref}`)
    }
    const key = ref.slice(prefix.length)
    const schema = spec?.components?.schemas?.[key]
    if (!schema) {
        throw new Error(`schema not found for ref: ${ref}`)
    }
    return schema as OpenApiSchema
}

const resolveSchema = (schema: OpenApiSchema): OpenApiSchema => {
    if (schema.$ref) {
        return resolveSchema(getSchemaByRef(schema.$ref))
    }
    if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
        return schema.allOf
            .map(item => resolveSchema(item))
            .reduce<OpenApiSchema>(
                (acc, current) => ({
                    ...acc,
                    ...current,
                    required: [...(acc.required ?? []), ...(current.required ?? [])],
                    properties: {
                        ...(acc.properties ?? {}),
                        ...(current.properties ?? {}),
                    },
                }),
                {}
            )
    }
    return schema
}

const validatePrimitive = (value: unknown, schemaType: string, location: string) => {
    if (schemaType === 'string') {
        expect(typeof value, `${location} should be string`).toBe('string')
        return
    }
    if (schemaType === 'integer') {
        expect(Number.isInteger(value), `${location} should be integer`).toBe(true)
        return
    }
    if (schemaType === 'number') {
        expect(typeof value, `${location} should be number`).toBe('number')
        return
    }
    if (schemaType === 'boolean') {
        expect(typeof value, `${location} should be boolean`).toBe('boolean')
    }
}

const validateBySchema = (value: unknown, rawSchema: OpenApiSchema, location: string) => {
    const schema = resolveSchema(rawSchema)
    if (schema.nullable && value === null) {
        return
    }
    if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
        const passed = schema.oneOf.some(item => {
            try {
                validateBySchema(value, item, location)
                return true
            } catch {
                return false
            }
        })
        expect(passed, `${location} should match oneOf schema`).toBe(true)
        return
    }
    if (schema.enum) {
        expect(schema.enum.includes(value), `${location} should be one of enum values`).toBe(true)
    }
    if (schema.type === 'array') {
        expect(Array.isArray(value), `${location} should be array`).toBe(true)
        const arrayValue = value as unknown[]
        if (schema.items) {
            arrayValue.forEach((item, index) => {
                validateBySchema(item, schema.items as OpenApiSchema, `${location}[${index}]`)
            })
        }
        return
    }
    if (schema.type === 'object' || schema.properties || schema.required) {
        expect(typeof value, `${location} should be object`).toBe('object')
        expect(value === null, `${location} should not be null`).toBe(false)
        const objectValue = value as Record<string, unknown>
        for (const key of schema.required ?? []) {
            expect(Object.prototype.hasOwnProperty.call(objectValue, key), `${location}.${key} should exist`).toBe(true)
        }
        for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
            if (!Object.prototype.hasOwnProperty.call(objectValue, key)) {
                continue
            }
            validateBySchema(objectValue[key], propSchema as OpenApiSchema, `${location}.${key}`)
        }
        return
    }
    if (schema.type) {
        validatePrimitive(value, schema.type, location)
    }
}

const getResponseSchema = (pathKey: string, method: Lowercase<HttpMethod>) => {
    const operation = spec?.paths?.[pathKey]?.[method]
    expect(operation, `operation missing: ${method.toUpperCase()} ${pathKey}`).toBeTruthy()
    const schema = operation.responses?.['200']?.content?.['application/json']?.schema
    expect(schema, `response schema missing: ${method.toUpperCase()} ${pathKey}`).toBeTruthy()
    return schema as OpenApiSchema
}

describe('openapi contract', () => {
    beforeAll(async () => {
        spec = await SwaggerParser.validate(contractPath)
    })

    beforeEach(() => {
        resetMockDb()
    })

    it('should keep core paths and schemas valid', () => {
        expect(spec.openapi).toBe('3.0.3')
        expect(spec.paths['/auth/login']).toBeTruthy()
        expect(spec.paths['/page/{pageId}/comments']).toBeTruthy()
        expect(spec.paths['/notifications']).toBeTruthy()
        expect(spec.paths['/audit/events']).toBeTruthy()
        expect(spec.paths['/audit/stats']).toBeTruthy()
        expect(spec.paths['/observability/dashboard']).toBeTruthy()
    })

    it('should match mock response fields with contract schemas', async () => {
        const login = await request('POST', '/auth/login', {
            data: { username: 'demo', password: '123456' },
        })
        validateBySchema(login, getResponseSchema('/auth/login', 'post'), 'login')
        const token = login.data.access_token as string

        const currentUser = await request('GET', '/currentUser', { token })
        validateBySchema(currentUser, getResponseSchema('/currentUser', 'get'), 'currentUser')

        const pageList = await request('GET', '/page', { token })
        validateBySchema(pageList, getResponseSchema('/page', 'get'), 'pageList')
        const pageId = pageList.data.pages[0].pageId as string

        const createdComment = await request('POST', `/page/${pageId}/comments`, {
            token,
            data: {
                content: 'ping @manager @nobody',
                mentions: ['manager', 'nobody'],
                anchor: { blockId: 'b1', from: 0, to: 4 },
            },
        })
        validateBySchema(createdComment, getResponseSchema('/page/{pageId}/comments', 'post'), 'createComment')

        const notifications = await request('GET', '/notifications', {
            token,
            params: { status: 'all', limit: 10 },
        })
        validateBySchema(notifications, getResponseSchema('/notifications', 'get'), 'notifications')

        const auditEvents = await request('GET', '/audit/events', {
            token,
            params: { type: 'comment_create', limit: 10 },
        })
        validateBySchema(auditEvents, getResponseSchema('/audit/events', 'get'), 'auditEvents')

        const auditStats = await request('GET', '/audit/stats', {
            token,
            params: { days: 7 },
        })
        validateBySchema(auditStats, getResponseSchema('/audit/stats', 'get'), 'auditStats')

        const retention = await request('GET', '/governance/retention', { token })
        validateBySchema(retention, getResponseSchema('/governance/retention', 'get'), 'retention')

        const observability = await request('GET', '/observability/dashboard', { token })
        validateBySchema(observability, getResponseSchema('/observability/dashboard', 'get'), 'observability')
    })
})
