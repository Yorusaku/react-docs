import { Controller, Get, Header } from '@nestjs/common'
import { collectDefaultMetrics, Counter, Gauge, Histogram, register } from 'prom-client'

// Collect default metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({ prefix: 'miaoma_' })

export const httpRequestDuration = new Histogram({
    name: 'miaoma_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
})

export const httpRequestTotal = new Counter({
    name: 'miaoma_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
})

export const collabConnectionsActive = new Gauge({
    name: 'miaoma_collab_connections_active',
    help: 'Active collaborative editing WebSocket connections',
})

@Controller('metrics')
export class MetricsController {
    @Get()
    @Header('Content-Type', register.contentType)
    async metrics() {
        return register.metrics()
    }
}
