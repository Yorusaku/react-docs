import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import * as srv from '@/services'

export function TrashPage() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['trash-pages'],
        queryFn: async () => (await srv.fetchTrashPageList()).data.pages,
    })

    return (
        <SidebarInset>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-700">回收站</h1>
                </div>
                <div className="space-y-2">
                    {isLoading && <div className="text-sm text-zinc-500">加载中...</div>}
                    {!isLoading &&
                        (data ?? []).map(page => (
                            <div key={page.pageId} className="rounded border border-zinc-200 p-3">
                                <div className="flex items-center justify-between">
                                    <Link className="font-medium hover:underline" to={`/doc/${page.pageId}`}>
                                        {page.emoji} {page.title}
                                    </Link>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={async () => {
                                                await srv.restorePage(page.pageId)
                                                await refetch()
                                            }}
                                        >
                                            恢复
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={async () => {
                                                await srv.permanentDeletePage(page.pageId)
                                                await refetch()
                                            }}
                                        >
                                            永久删除
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    删除时间：{page.deletedAt ? new Date(page.deletedAt).toLocaleString() : '-'}
                                </div>
                            </div>
                        ))}
                    {!isLoading && (data?.length ?? 0) === 0 && <div className="text-sm text-zinc-500">回收站为空</div>}
                </div>
            </div>
        </SidebarInset>
    )
}
