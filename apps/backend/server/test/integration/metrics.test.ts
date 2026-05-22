import { Test, TestingModule } from '@nestjs/testing'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { MetricsController } from '../../src/fundamentals/observability/metrics.controller'

describe('MetricsController', () => {
    let controller: MetricsController
    let module: TestingModule

    beforeAll(async () => {
        module = await Test.createTestingModule({
            controllers: [MetricsController],
        }).compile()

        controller = module.get(MetricsController)
    })

    afterAll(async () => {
        await module?.close()
    })

    describe('GET /metrics', () => {
        it('should return text/plain prometheus format', async () => {
            const result = await controller.metrics()

            expect(typeof result).toBe('string')
            expect(result).toContain('miaoma_')
        })

        it('should contain default nodejs metrics', async () => {
            const result = await controller.metrics()

            expect(result).toContain('process_cpu_seconds_total')
        })

        it('should contain custom http request duration histogram', async () => {
            const result = await controller.metrics()

            expect(result).toContain('miaoma_http_request_duration_seconds')
        })

        it('should contain custom http request counter', async () => {
            const result = await controller.metrics()

            expect(result).toContain('miaoma_http_requests_total')
        })

        it('should contain collab connections gauge', async () => {
            const result = await controller.metrics()

            expect(result).toContain('miaoma_collab_connections_active')
        })
    })
})
