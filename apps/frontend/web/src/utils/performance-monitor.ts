/**
 * Performance monitoring for collaboration features
 */

export interface PerformanceStats {
    inputLatency: {
        avg: number
        min: number
        max: number
        count: number
    }
    syncLatency: {
        avg: number
        min: number
        max: number
        count: number
    }
    renderLatency: {
        avg: number
        min: number
        max: number
        count: number
    }
    awarenessUpdateCount: number
    awarenessUpdateRate: number // updates per second
}

export class CollaborationPerformanceMonitor {
    private metrics = {
        inputLatency: [] as number[],
        syncLatency: [] as number[],
        renderLatency: [] as number[],
        awarenessUpdateCount: 0,
        startTime: Date.now(),
    }

    private maxSamples = 100

    recordInputLatency(latency: number): void {
        this.metrics.inputLatency.push(latency)
        if (this.metrics.inputLatency.length > this.maxSamples) {
            this.metrics.inputLatency.shift()
        }
    }

    recordSyncLatency(latency: number): void {
        this.metrics.syncLatency.push(latency)
        if (this.metrics.syncLatency.length > this.maxSamples) {
            this.metrics.syncLatency.shift()
        }
    }

    recordRenderLatency(latency: number): void {
        this.metrics.renderLatency.push(latency)
        if (this.metrics.renderLatency.length > this.maxSamples) {
            this.metrics.renderLatency.shift()
        }
    }

    recordAwarenessUpdate(): void {
        this.metrics.awarenessUpdateCount++
    }

    private calculateStats(values: number[]) {
        if (values.length === 0) {
            return { avg: 0, min: 0, max: 0, count: 0 }
        }
        const sum = values.reduce((a, b) => a + b, 0)
        return {
            avg: Math.round(sum / values.length),
            min: Math.round(Math.min(...values)),
            max: Math.round(Math.max(...values)),
            count: values.length,
        }
    }

    getStats(): PerformanceStats {
        const elapsedSeconds = (Date.now() - this.metrics.startTime) / 1000

        return {
            inputLatency: this.calculateStats(this.metrics.inputLatency),
            syncLatency: this.calculateStats(this.metrics.syncLatency),
            renderLatency: this.calculateStats(this.metrics.renderLatency),
            awarenessUpdateCount: this.metrics.awarenessUpdateCount,
            awarenessUpdateRate: Math.round((this.metrics.awarenessUpdateCount / elapsedSeconds) * 100) / 100,
        }
    }

    logStats(): void {
        const stats = this.getStats()
        console.group('📊 Collaboration Performance Stats')
        console.log('Input Latency:', `${stats.inputLatency.avg}ms avg (${stats.inputLatency.min}-${stats.inputLatency.max}ms)`)
        console.log('Sync Latency:', `${stats.syncLatency.avg}ms avg (${stats.syncLatency.min}-${stats.syncLatency.max}ms)`)
        console.log('Render Latency:', `${stats.renderLatency.avg}ms avg (${stats.renderLatency.min}-${stats.renderLatency.max}ms)`)
        console.log('Awareness Updates:', `${stats.awarenessUpdateCount} total (${stats.awarenessUpdateRate}/s)`)
        console.groupEnd()
    }

    reset(): void {
        this.metrics = {
            inputLatency: [],
            syncLatency: [],
            renderLatency: [],
            awarenessUpdateCount: 0,
            startTime: Date.now(),
        }
    }
}

// Global instance
export const perfMonitor = new CollaborationPerformanceMonitor()
