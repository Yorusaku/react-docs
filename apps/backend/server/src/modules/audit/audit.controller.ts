import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { AuditService } from './audit.service'

@Controller('audit')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @Get('events')
    async getEvents(@Query() query: any) {
        const data = await this.auditService.query({
            type: query.type,
            actorUserId: query.actorUserId ? Number(query.actorUserId) : undefined,
            targetType: query.targetType,
            from: query.from,
            to: query.to,
            cursor: query.cursor,
            limit: query.limit ? Number(query.limit) : undefined,
        })
        return { success: true as const, data }
    }

    @Get('stats')
    async getStats(@Query('days') days?: string) {
        const data = await this.auditService.stats({ days: days ? Number(days) : undefined })
        return { success: true as const, data }
    }

    @Post('emit')
    async emitEvent(@Body() body: any) {
        await this.auditService.emit({
            type: body.type,
            summary: body.summary,
            targetType: body.targetType,
            targetId: body.targetId,
            meta: body.meta,
        })
        return { success: true as const, data: { success: true } }
    }
}
