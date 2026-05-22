import { describe, expect, it } from 'vitest'

import { validateEnv } from '../../src/fundamentals/security/env.validation'

describe('validateEnv', () => {
    const originalEnv = { ...process.env }

    it('should pass with valid environment', () => {
        process.env = {
            ...originalEnv,
            JWT_SECRET: 'a-very-strong-secret-key-for-testing',
            PG_HOST: '127.0.0.1',
            PG_PORT: '5433',
            PG_USER: 'postgres',
            PG_PASSWORD: 'test',
            PG_DATABASE: 'test_db',
            SERVER_PORT: '8082',
        }

        const result = validateEnv()
        expect(result.JWT_SECRET).toBe('a-very-strong-secret-key-for-testing')
        expect(result.PG_PORT).toBe(5433)
        expect(result.SERVER_PORT).toBe(8082)
    })

    it('should apply defaults when optional vars are missing', () => {
        process.env = {
            ...originalEnv,
            JWT_SECRET: 'a-very-strong-secret-key-for-testing',
        }

        const result = validateEnv()
        expect(result.PG_HOST).toBe('127.0.0.1')
        expect(result.PG_PORT).toBe(5433)
        expect(result.SERVER_PORT).toBe(8082)
    })

    it('should throw when JWT_SECRET is missing', () => {
        process.env = { ...originalEnv }
        delete process.env.JWT_SECRET

        expect(() => validateEnv()).toThrow('Environment validation failed')
    })

    it('should throw when JWT_SECRET is too short', () => {
        process.env = { ...originalEnv, JWT_SECRET: 'short' }

        expect(() => validateEnv()).toThrow('at least 16 characters')
    })
})
