import { AuditEventsRes, AuditStatsRes } from '@/types/api'
import { request } from '@/utils/request'

export const fetchAuditEvents = async (params?: {
    type?: string
    actorUserId?: number
    targetType?: string
    from?: string
    to?: string
    cursor?: string
    limit?: number
}): Promise<AuditEventsRes> => {
    return await request.get('/audit/events', { params })
}

export const fetchAuditStats = async (params?: { days?: number }): Promise<AuditStatsRes> => {
    return await request.get('/audit/stats', { params })
}

export const emitAuditEvent = async (payload: {
    type: string
    summary: string
    targetType?: string
    targetId?: string
    meta?: Record<string, unknown>
}) => {
    return await request.post('/audit/emit', payload)
}
