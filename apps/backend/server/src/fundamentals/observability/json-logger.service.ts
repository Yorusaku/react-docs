import { randomUUID } from 'node:crypto'

import { Injectable, LoggerService } from '@nestjs/common'

/**
 * Structured JSON logger implementing NestJS LoggerService.
 * Outputs one JSON object per line with traceId for request correlation.
 */
@Injectable()
export class JsonLoggerService implements LoggerService {
    private traceId(): string {
        return randomUUID()
    }

    private format(level: string, message: string, context?: string, trace?: string) {
        const entry: Record<string, unknown> = {
            timestamp: new Date().toISOString(),
            level,
            traceId: this.traceId(),
            context: context ?? 'App',
            message,
        }
        if (trace) {
            entry.trace = trace
        }
        return JSON.stringify(entry)
    }

    log(message: string, context?: string) {
        process.stdout.write(this.format('info', message, context) + '\n')
    }

    error(message: string, trace?: string, context?: string) {
        process.stderr.write(this.format('error', message, context, trace) + '\n')
    }

    warn(message: string, context?: string) {
        process.stderr.write(this.format('warn', message, context) + '\n')
    }

    debug(message: string, context?: string) {
        process.stdout.write(this.format('debug', message, context) + '\n')
    }
}
