import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'

import * as srv from '@/services'

export function NotificationsPage() {
    const { data, refetch, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            return (await srv.fetchNotifications()).data
        },
    })

    const markAll = async () => {
        await srv.markAllNotificationsRead()
        await refetch()
    }

    return (
        <SidebarInset>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-700">通知中心</h1>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-zinc-500">未读：{data?.unreadCount ?? 0}</p>
                    <Button size="sm" variant="outline" onClick={() => void markAll()}>
                        全部已读
                    </Button>
                </div>
                <div className="space-y-2">
                    {isLoading && <div className="text-sm text-zinc-500">加载中...</div>}
                    {!isLoading &&
                        (data?.items ?? []).map(item => (
                            <div key={item.notificationId} className="rounded border border-zinc-200 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{item.title}</div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={async () => {
                                            await srv.markNotificationRead(item.notificationId)
                                            await refetch()
                                        }}
                                    >
                                        {item.readAt ? '已读' : '标记已读'}
                                    </Button>
                                </div>
                                {item.content && <div className="text-sm text-zinc-600 mt-1">{item.content}</div>}
                                <div className="text-xs text-zinc-500 mt-1">{new Date(item.createdAt).toLocaleString()}</div>
                            </div>
                        ))}
                    {!isLoading && (data?.items?.length ?? 0) === 0 && <div className="text-sm text-zinc-500">暂无通知</div>}
                </div>
            </div>
        </SidebarInset>
    )
}
