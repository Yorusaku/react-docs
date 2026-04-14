import { IncomingMessage } from 'node:http'

import { JwtService } from '@nestjs/jwt'
import { describe, expect, it } from 'vitest'

import { resolveWsToken, verifyWsToken } from '../src/modules/doc-yjs/ws-auth'

describe('ws-auth', () => {
    it('should resolve token from query string first', () => {
        const req = {
            url: '/doc-yjs?token=query-token',
            headers: {
                authorization: 'Bearer header-token',
            },
        } as IncomingMessage

        expect(resolveWsToken(req)).toBe('query-token')
    })

    it('should resolve token from authorization header', () => {
        const req = {
            url: '/doc-yjs',
            headers: {
                authorization: 'Bearer header-token',
            },
        } as IncomingMessage

        expect(resolveWsToken(req)).toBe('header-token')
    })

    it('should verify token payload', () => {
        const jwtService = new JwtService({
            secret: process.env.JWT_SECRET,
        })
        const token = jwtService.sign({ sub: 1001 })

        const payload = verifyWsToken(jwtService, token)

        expect(payload.sub).toBe(1001)
    })
})
