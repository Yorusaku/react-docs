import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'

import * as srv from '@/services'

export function ObservabilityPage() {
    const { data, refetch, isFetching } = useQuery({
        queryKey: ['observability-dashboard'],
        queryFn: async () => (await srv.fetchObservabilityDashboard()).data,
    })

    return (
        <SidebarInset>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-700">可观测面板</h1>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-zinc-500">mode: {data?.mode ?? '-'}</p>
                    <Button size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
                        {isFetching ? '刷新中...' : '刷新指标'}
                    </Button>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                    generatedAt: {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '-'} · ai window:
                    {data?.windows.aiRateLimitSeconds ?? '-'}s · audit trend: {data?.windows.auditTrendDays ?? '-'}d
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500 mb-1">协同连接</p>
                        <p className="text-lg font-semibold">{data?.collaboration.currentConnections ?? 0}</p>
                        <p className="text-xs text-zinc-500 mt-1">{data?.collaboration.wsGateway ?? '/doc-yjs'}</p>
                        <p className="text-[11px] text-zinc-400 mt-2">{data?.definitions.collaboration ?? '-'}</p>
                    </div>
                    <div className="rounded border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500 mb-1">索引任务积压</p>
                        <p className="text-lg font-semibold">{data?.searchIndex.pendingJobs ?? 0}</p>
                        <p className="text-xs text-zinc-500 mt-1">indexed pages: {data?.searchIndex.indexedPages ?? 0}</p>
                        <p className="text-[11px] text-zinc-400 mt-2">{data?.definitions.searchIndex ?? '-'}</p>
                    </div>
                    <div className="rounded border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500 mb-1">AI 限流命中</p>
                        <p className="text-lg font-semibold">{data?.aiRateLimit.hitCount ?? 0}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {data?.aiRateLimit.maxRequestPerWindow ?? 20} / {data?.aiRateLimit.windowSeconds ?? 60}s
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-2">{data?.definitions.aiRateLimit ?? '-'}</p>
                    </div>
                    <div className="rounded border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500 mb-1">审计事件总量</p>
                        <p className="text-lg font-semibold">{data?.audit.totalEvents ?? 0}</p>
                        <p className="text-xs text-zinc-500 mt-1">未读通知: {data?.notifications.unreadCount ?? 0}</p>
                        <p className="text-[11px] text-zinc-400 mt-2">{data?.definitions.audit ?? '-'}</p>
                    </div>
                </div>
            </div>
        </SidebarInset>
    )
}
