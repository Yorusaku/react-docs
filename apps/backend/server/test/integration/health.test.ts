import { DataSource } from 'typeorm'
import { describe, expect, it } from 'vitest'

import { HealthController } from '../../src/fundamentals/observability/health.controller'

describe('HealthController', () => {
    describe('GET /health (liveness)', () => {
        it('should return ok status with 200', () => {
            const controller = new HealthController(undefined as unknown as DataSource)
            const result = controller.liveness()

            expect(result.status).toBe('ok')
            expect(result.timestamp).toBeTruthy()
            expect(new Date(result.timestamp).getTime()).not.toBeNaN()
        })
    })

    describe('GET /health/ready (readiness)', () => {
        it('should return ok when database is connected', () => {
            const controller = new HealthController({ isInitialized: true } as DataSource)
            const result = controller.readiness()

            expect(result.status).toBe('ok')
            expect(result.database).toBe('connected')
        })

        it('should return error when database is disconnected', () => {
            const controller = new HealthController({ isInitialized: false } as DataSource)
            const result = controller.readiness()

            expect(result.status).toBe('error')
            expect(result.database).toBe('disconnected')
        })

        it('should return error when DataSource is not provided', () => {
            const controller = new HealthController(undefined)
            const result = controller.readiness()

            expect(result.status).toBe('error')
            expect(result.database).toBe('disconnected')
        })
    })
})
