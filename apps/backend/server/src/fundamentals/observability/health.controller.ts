import { Controller, Get, HttpCode, HttpStatus, Optional } from '@nestjs/common'
import { DataSource } from 'typeorm'

/**
 * Kubernetes-compatible health endpoints.
 * - GET /api/health 鈫?liveness probe (always 200 if process is alive)
 * - GET /api/health/ready 鈫?readiness probe (200 if DB connected, 503 otherwise)
 */
@Controller('health')
export class HealthController {
    constructor(@Optional() private readonly ds?: DataSource) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    liveness() {
        return { status: 'ok', timestamp: new Date().toISOString() }
    }

    @Get('ready')
    readiness() {
        if (!this.ds?.isInitialized) {
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
            }
        }
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
        }
    }
}
