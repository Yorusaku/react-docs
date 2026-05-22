import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useEffect, useState } from 'react'

import * as srv from '@/services'
import { AuditEventItem, AuditStatsRes } from '@/types/api'

export function AuditPage() {
    const [items, setItems] = useState<AuditEventItem[]>([])
    const [stats, setStats] = useState<AuditStatsRes['data'] | null>(null)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState('')
    const [actorUserId, setActorUserId] = useState('')
    const [targetType, setTargetType] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')

    const loadStats = async () => {
        const result = await srv.fetchAuditStats({ days: 7 })
        setStats(result.data)
    }

    const loadEvents = async () => {
        setLoading(true)
        try {
            const result = await srv.fetchAuditEvents({
                type: type.trim() || undefined,
                actorUserId: actorUserId.trim() ? Number(actorUserId.trim()) : undefined,
                targetType: targetType.trim() || undefined,
                from: from.trim() || undefined,
                to: to.trim() || undefined,
                limit: 50,
            })
            setItems(result.data.items)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadStats()
        void loadEvents()
    }, [])

    return (
        <SidebarInset>
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-700">审计事件中心</h1>
                </div>
                <p className="text-sm text-zinc-500">重点追踪登录、分享、权限变更、删除恢复、导出、SSO 等关键行为。</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded border border-zinc-200 p-3">
                        <p className="text-xs text-zinc-500">近 {stats?.days ?? 7} 天事件总量</p>
                        <p className="text-lg font-semibold">{stats?.total ?? 0}</p>
                    </div>
                    <div className="rounded border border-zinc-200 p-3">
                        <p className="text-xs text-zinc-500">事件类型数</p>
                        <p className="text-lg font-semibold">{stats?.byType.length ?? 0}</p>
                    </div>
                    <div className="rounded border border-zinc-200 p-3">
                        <p className="text-xs text-zinc-500">活跃操作者</p>
                        <p className="text-lg font-semibold">{stats?.topActors.length ?? 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input value={type} onChange={event => setType(event.target.value)} placeholder="事件类型，如 acl_update" />
                    <Input value={actorUserId} onChange={event => setActorUserId(event.target.value)} placeholder="操作者 userId" />
                    <Input
                        value={targetType}
                        onChange={event => setTargetType(event.target.value)}
                        placeholder="目标类型，如 page/comment"
                    />
                    <Input
                        value={from}
                        onChange={event => setFrom(event.target.value)}
                        placeholder="起始时间 ISO，如 2026-01-01T00:00:00.000Z"
                    />
                    <Input
                        value={to}
                        onChange={event => setTo(event.target.value)}
                        placeholder="结束时间 ISO，如 2026-12-31T23:59:59.999Z"
                    />
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                void loadEvents()
                            }}
                            disabled={loading}
                        >
                            {loading ? '查询中...' : '查询'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                void loadStats()
                            }}
                        >
                            刷新统计
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.eventId} className="rounded border border-zinc-200 p-3">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">{item.summary}</p>
                                <p className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                type={item.type} actor={item.actorUserId ?? '-'} target={item.targetType}:{item.targetId ?? '-'}
                            </p>
                        </div>
                    ))}
                    {!loading && items.length === 0 && <p className="text-sm text-zinc-500">暂无审计数据</p>}
                </div>
            </div>
        </SidebarInset>
    )
}
