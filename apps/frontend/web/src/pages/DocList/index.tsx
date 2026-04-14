import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNowStrict } from 'date-fns'
import { MoreVertical, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import * as srv from '@/services'
import { randomEmoji } from '@/utils/randomEmoji'

export function DocList() {
    const navigate = useNavigate()
    const [templateKeyword, setTemplateKeyword] = useState('')

    const { data: pages = [], refetch } = useQuery({
        queryKey: ['pages'],
        queryFn: async () => (await srv.fetchPageList()).data.pages,
    })

    const { data: templates = [] } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => (await srv.fetchTemplates()).data,
    })

    const visibleTemplates = useMemo(
        () => templates.filter(item => item.name.includes(templateKeyword) || item.title.includes(templateKeyword)),
        [templateKeyword, templates]
    )

    const handleCreate = async () => {
        const res = await srv.createPage({
            emoji: randomEmoji(),
            title: 'Untitled Document',
        })
        navigate(`/doc/${res.data.pageId}`)
        await refetch()
    }

    return (
        <SidebarInset>
            <div className="flex flex-col w-full h-full">
                <div className="flex flex-row justify-between p-6">
                    <div className="flex flex-row items-center gap-2">
                        <SidebarTrigger />
                        <h1 className="text-xl text-zinc-500">全部文档</h1>
                    </div>
                    <Button size="sm" onClick={() => void handleCreate()}>
                        <Plus size={16} />
                        新建文档
                    </Button>
                </div>

                <div className="px-6 mb-4">
                    <div className="rounded border border-zinc-200 p-3">
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="text-sm font-medium">模板入口</p>
                            <Input
                                className="max-w-[220px] h-8"
                                value={templateKeyword}
                                onChange={event => setTemplateKeyword(event.target.value)}
                                placeholder="筛选模板"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {visibleTemplates.slice(0, 8).map(template => (
                                <Button
                                    key={template.templateId}
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                        const res = await srv.createPageFromTemplate(template.templateId)
                                        navigate(`/doc/${res.data.pageId}`)
                                        await refetch()
                                    }}
                                >
                                    {template.emoji} {template.name}
                                </Button>
                            ))}
                            {visibleTemplates.length === 0 && <span className="text-xs text-zinc-500">暂无可用模板</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    {pages.map(page => (
                        <Link
                            key={page.pageId}
                            to={`/doc/${page.pageId}`}
                            className="flex flex-row items-center justify-between py-3 px-6 hover:bg-zinc-50"
                        >
                            <div className="flex flex-row items-center">
                                <span className="text-xl">{page.emoji}</span>
                                <span className="ml-6 text-sm font-semibold">{page.title}</span>
                            </div>
                            <div className="flex flex-row items-center gap-4">
                                <span className="text-sm text-zinc-500">{formatDistanceToNowStrict(page.createdAt)}前</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-zinc-500"
                                    onClick={event => {
                                        event.stopPropagation()
                                        event.preventDefault()
                                    }}
                                >
                                    <MoreVertical size={16} />
                                </Button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </SidebarInset>
    )
}
