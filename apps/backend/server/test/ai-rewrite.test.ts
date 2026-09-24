import { BadGatewayException, ForbiddenException, GatewayTimeoutException, ServiceUnavailableException } from '@nestjs/common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { aiRewriteSchema } from '../src/modules/ai/ai.dto'
import { AiService } from '../src/modules/ai/ai.service'
import { PageAccessService } from '../src/modules/page/page-access.service'

describe('AI selection rewrite', () => {
    const originalEnv = { ...process.env }
    const originalFetch = global.fetch
    const assertAction = vi.fn()
    const service = new AiService({ assertAction } as unknown as PageAccessService)
    const payload = { pageId: 'page-1', action: 'polish' as const, text: '原文' }

    beforeEach(() => {
        process.env.AI_API_BASE_URL = 'https://example.test/api/v3'
        process.env.AI_API_KEY = 'test-only'
        process.env.AI_MODEL = 'test-model'
        assertAction.mockReset()
    })
    afterEach(() => {
        process.env = { ...originalEnv }
        global.fetch = originalFetch
    })

    it('rejects blank and oversized selections', () => {
        expect(aiRewriteSchema.safeParse({ ...payload, text: ' ' }).success).toBe(false)
        expect(aiRewriteSchema.safeParse({ ...payload, text: 'a'.repeat(4001) }).success).toBe(false)
    })

    it('rejects viewer before calling the model', async () => {
        assertAction.mockRejectedValue(new ForbiddenException())
        const fetchMock = vi.fn()
        global.fetch = fetchMock
        await expect(service.rewrite(payload, 1)).rejects.toBeInstanceOf(ForbiddenException)
        expect(assertAction).toHaveBeenCalledWith('page-1', 1, 'write')
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('sends only the selection and returns valid model text', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: ' 改写后 ' } }] }) })
        await expect(service.rewrite(payload, 2)).resolves.toEqual({ text: '改写后' })
        const [, options] = vi.mocked(global.fetch).mock.calls[0]
        const body = JSON.parse(options?.body as string)
        expect(body.messages[1].content).toBe('原文')
        expect(JSON.stringify(body)).not.toContain('page-1')
    })

    it('handles timeout, upstream errors and empty output', async () => {
        global.fetch = vi.fn().mockRejectedValue(Object.assign(new Error('timeout'), { name: 'TimeoutError' }))
        await expect(service.rewrite(payload, 3)).rejects.toBeInstanceOf(GatewayTimeoutException)
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        await expect(service.rewrite(payload, 3)).rejects.toBeInstanceOf(BadGatewayException)
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: ' ' } }] }) })
        await expect(service.rewrite(payload, 3)).rejects.toBeInstanceOf(BadGatewayException)
    })

    it('rejects missing server configuration', async () => {
        delete process.env.AI_API_KEY
        await expect(service.rewrite(payload, 4)).rejects.toBeInstanceOf(ServiceUnavailableException)
    })
})
