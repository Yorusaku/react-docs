import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { LessThan, Repository } from 'typeorm'

import { AuditEventEntity } from '../../../entities/audit-event.entity'

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditEventEntity)
        private readonly auditRepo: Repository<AuditEventEntity>,
    ) {}

    async emit(payload: {
        type: string
        summary: string
        actorUserId?: number | null
        targetType?: string
        targetId?: string | null
        meta?: Record<string, unknown>
    }) {
        const event = this.auditRepo.create({
            eventId: 'evt_' + nanoid(12),
            type: payload.type,
            summary: payload.summary,
            actorUserId: payload.actorUserId ?? null,
            targetType: payload.targetType ?? 'unknown',
            targetId: payload.targetId ?? null,
            meta: payload.meta ?? {},
        })
        const saved = await this.auditRepo.save(event)
        return {
            eventId: saved.eventId,
            type: saved.type,
            actorUserId: saved.actorUserId,
            targetType: saved.targetType,
            targetId: saved.targetId,
            summary: saved.summary,
            meta: saved.meta,
            createdAt: saved.createdAt.toISOString(),
        }
    }

    async query(params: {
        type?: string
        actorUserId?: number
        targetType?: string
        from?: string
        to?: string
        cursor?: string
        limit?: number
    }) {
        const limit = Math.min(Math.max(Number(params.limit ?? 20), 1), 100)
        const qb = this.auditRepo.createQueryBuilder('e').orderBy('e.createdAt', 'DESC').take(limit + 1)

        if (params.type) qb.andWhere('e.type = :type', { type: params.type })
        if (params.actorUserId !== undefined) qb.andWhere('e.actorUserId = :actorUserId', { actorUserId: params.actorUserId })
        if (params.targetType) qb.andWhere('e.targetType = :targetType', { targetType: params.targetType })
        if (params.from) qb.andWhere('e.createdAt >= :from', { from: params.from })
        if (params.to) qb.andWhere('e.createdAt <= :to', { to: params.to })
        if (params.cursor) qb.andWhere('e.createdAt < :cursor', { cursor: params.cursor })

        const rows = await qb.getMany()
        const hasNext = rows.length > limit
        const items = rows.slice(0, limit).map(e => ({
            eventId: e.eventId,
            type: e.type,
            actorUserId: e.actorUserId,
            targetType: e.targetType,
            targetId: e.targetId,
            summary: e.summary,
            meta: e.meta,
            createdAt: e.createdAt.toISOString(),
        }))
        return { items, nextCursor: hasNext ? (items[items.length - 1]?.createdAt ?? null) : null }
    }

    async stats(params: { days?: number }) {
        const days = Math.max(Number(params.days ?? 7), 1)
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

        const rows = await this.auditRepo
            .createQueryBuilder('e')
            .where('e.createdAt >= :since', { since })
            .orderBy('e.createdAt', 'DESC')
            .getMany()

        const byTypeMap = new Map<string, number>()
        const trendMap = new Map<string, number>()
        const actorMap = new Map<string, number>()

        for (const row of rows) {
            byTypeMap.set(row.type, (byTypeMap.get(row.type) ?? 0) + 1)
            const date = row.createdAt.toISOString().slice(0, 10)
            trendMap.set(date, (trendMap.get(date) ?? 0) + 1)
            const actorKey = String(row.actorUserId ?? 'null')
            actorMap.set(actorKey, (actorMap.get(actorKey) ?? 0) + 1)
        }

        const byType = Array.from(byTypeMap.entries()).map(([type, count]) => ({ type, count }))
        const trend = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }))
        const topActors = Array.from(actorMap.entries())
            .map(([actorUserId, count]) => ({ actorUserId: actorUserId === 'null' ? null : Number(actorUserId), count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        return { days, total: rows.length, byType, trend, topActors }
    }

    async cleanupExpired(auditDays: number) {
        const threshold = new Date(Date.now() - auditDays * 24 * 60 * 60 * 1000)
        await this.auditRepo.delete({ createdAt: LessThan(threshold) })
    }
}
