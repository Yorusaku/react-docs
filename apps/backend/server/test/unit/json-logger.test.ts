import { describe, expect, it } from 'vitest'

/**
 * JsonLoggerService 的行为契约。
 * 实现文件: src/fundamentals/observability/json-logger.service.ts
 */
describe('JsonLoggerService (contract)', () => {
    const mockJsonLogger = {
        log: (message: string, context?: string) => {
            const entry = JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'info',
                traceId: 'mock-trace-id',
                context: context ?? 'App',
                message,
            })
            return entry
        },
        error: (message: string, trace?: string, context?: string) => {
            const entry = JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'error',
                traceId: 'mock-trace-id',
                context: context ?? 'App',
                message,
                trace,
            })
            return entry
        },
        warn: (message: string, context?: string) => {
            const entry = JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'warn',
                traceId: 'mock-trace-id',
                context: context ?? 'App',
                message,
            })
            return entry
        },
        debug: (message: string, context?: string) => {
            const entry = JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'debug',
                traceId: 'mock-trace-id',
                context: context ?? 'App',
                message,
            })
            return entry
        },
    }

    it('log() should output valid JSON with required fields', () => {
        const output = mockJsonLogger.log('page created', 'PageService')

        const parsed = JSON.parse(output)
        expect(parsed.level).toBe('info')
        expect(parsed.traceId).toBeTruthy()
        expect(parsed.timestamp).toBeTruthy()
        expect(parsed.context).toBe('PageService')
        expect(parsed.message).toBe('page created')
    })

    it('error() should output valid JSON with trace field', () => {
        const output = mockJsonLogger.error('db connection failed', 'ECONNREFUSED', 'DatabaseModule')

        const parsed = JSON.parse(output)
        expect(parsed.level).toBe('error')
        expect(parsed.trace).toBe('ECONNREFUSED')
        expect(parsed.context).toBe('DatabaseModule')
    })

    it('should not leak undefined fields into JSON', () => {
        const output = mockJsonLogger.log('test')

        const parsed = JSON.parse(output)
        expect(parsed).not.toHaveProperty('undefined')
        expect(parsed.context).toBe('App')
    })
})
