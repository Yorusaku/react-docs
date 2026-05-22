import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { ScrollArea } from '@miaoma-doc/shadcn-shared-ui/components/ui/scroll-area'
import { Separator } from '@miaoma-doc/shadcn-shared-ui/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/tabs'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { useState } from 'react'

import * as srv from '@/services'
import { queryClient } from '@/utils/query-client'

interface GovernanceDrawerProps {
    pageId: string
    canWrite?: boolean
    canTemplateManage?: boolean
    canRestore?: boolean
}

export function GovernanceDrawer({ pageId, canWrite = false, canTemplateManage = false, canRestore = false }: GovernanceDrawerProps) {
    const [open, setOpen] = useState(false)

    const { data: templates } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => (await srv.fetchTemplates()).data,
        enabled: open,
    })

    const { data: pageTags } = useQuery({
        queryKey: ['page-tags', pageId],
        queryFn: async () => (await srv.fetchPageTags(pageId)).data,
        enabled: open,
    })

    const { data: allTags } = useQuery({
        queryKey: ['all-tags'],
        queryFn: async () => (await srv.fetchTags()).data,
        enabled: open,
    })

    const { data: snapshots } = useQuery({
        queryKey: ['page-snapshots', pageId],
        queryFn: async () => (await srv.fetchPageSnapshots(pageId)).data,
        enabled: open,
    })

    const invalidateAll = () => {
        void queryClient.invalidateQueries({ queryKey: ['templates'] })
        void queryClient.invalidateQueries({ queryKey: ['page-tags', pageId] })
        void queryClient.invalidateQueries({ queryKey: ['all-tags'] })
        void queryClient.invalidateQueries({ queryKey: ['page-snapshots', pageId] })
        void queryClient.invalidateQueries({ queryKey: ['page', pageId] })
        void queryClient.invalidateQueries({ queryKey: ['pages'] })
        void queryClient.invalidateQueries({ queryKey: ['search'] })
    }

    const createFromPageMutation = useMutation({
        mutationFn: async () => srv.createTemplateFromPage(pageId),
        onSuccess: () => invalidateAll(),
    })

    const deleteTemplateMutation = useMutation({
        mutationFn: async (templateId: string) => srv.removeTemplate(templateId),
        onSuccess: () => invalidateAll(),
    })

    const addTagMutation = useMutation({
        mutationFn: async (tagName: string) => {
            const current = (pageTags ?? []).map(t => t.name)
            return srv.updatePageTags(pageId, [...current, tagName])
        },
        onSuccess: () => invalidateAll(),
    })

    const removeTagMutation = useMutation({
        mutationFn: async () => { /* handled inline via updatePageTags */ },
        onSuccess: () => invalidateAll(),
    })

    const createSnapshotMutation = useMutation({
        mutationFn: async () => srv.createPageSnapshot(pageId),
        onSuccess: () => invalidateAll(),
    })

    const restoreSnapshotMutation = useMutation({
        mutationFn: async (snapshotId: string) => srv.restorePageSnapshot(pageId, snapshotId),
        onSuccess: () => invalidateAll(),
    })

    const [newTagName, setNewTagName] = useState('')

    const currentTagNames = new Set((pageTags ?? []).map(t => t.name))
    const tagOptions = (allTags ?? []).filter(at => !currentTagNames.has(at.name))

    const handleRemoveTag = async (tagName: string) => {
        const remaining = (pageTags ?? []).filter(t => t.name !== tagName).map(t => t.name)
        await srv.updatePageTags(pageId, remaining)
        invalidateAll()
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                    <Settings className="h-4 w-4" />
                    治理
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:max-w-[500px]">
                <SheetHeader>
                    <SheetTitle>治理中心</SheetTitle>
                    <SheetDescription>模板、标签与快照管理</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                    <Tabs defaultValue="snapshots">
                        <TabsList className="w-full">
                            <TabsTrigger value="snapshots" className="flex-1">快照</TabsTrigger>
                            <TabsTrigger value="templates" className="flex-1">模板</TabsTrigger>
                            <TabsTrigger value="tags" className="flex-1">标签</TabsTrigger>
                        </TabsList>

                        <TabsContent value="snapshots" className="space-y-3 pt-4">
                            {canWrite && (
                                <Button size="sm" onClick={() => createSnapshotMutation.mutate()} disabled={createSnapshotMutation.isPending}>
                                    {createSnapshotMutation.isPending ? '创建中...' : '创建快照'}
                                </Button>
                            )}
                            <Separator />
                            {(snapshots ?? []).length === 0 && <p className="text-sm text-zinc-500">暂无快照</p>}
                            {(snapshots ?? []).map(s => (
                                <div key={s.snapshotId} className="rounded border border-zinc-200 p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{s.title}</p>
                                        {canRestore && (
                                            <Button size="sm" variant="outline" onClick={() => restoreSnapshotMutation.mutate(s.snapshotId)} disabled={restoreSnapshotMutation.isPending}>
                                                恢复
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {new Date(s.createdAt).toLocaleString()} · {s.reason}
                                        {s.createdBy && ` · ${s.createdBy.username}`}
                                    </p>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="templates" className="space-y-3 pt-4">
                            {canTemplateManage && (
                                <Button size="sm" onClick={() => createFromPageMutation.mutate()} disabled={createFromPageMutation.isPending} variant="secondary">
                                    {createFromPageMutation.isPending ? '生成中...' : '从当前页面生成模板'}
                                </Button>
                            )}
                            <Separator />
                            {(templates ?? []).length === 0 && <p className="text-sm text-zinc-500">暂无模板</p>}
                            {(templates ?? []).map(t => (
                                <div key={t.templateId} className="rounded border border-zinc-200 p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{t.emoji} {t.name}</p>
                                            <p className="text-xs text-zinc-500">{t.title}</p>
                                        </div>
                                        {canTemplateManage && (
                                            <Button size="sm" variant="ghost" onClick={() => deleteTemplateMutation.mutate(t.templateId)} disabled={deleteTemplateMutation.isPending}>
                                                删除
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="tags" className="space-y-3 pt-4">
                            {(pageTags ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {(pageTags ?? []).map(tag => (
                                        <span key={tag.tagId} className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-xs">
                                            {tag.name}
                                            {canWrite && (
                                                <button className="ml-1 text-zinc-400 hover:text-red-500" onClick={() => handleRemoveTag(tag.name)}>x</button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {canWrite && (
                                <div className="flex gap-2">
                                    <Input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="新标签名" className="h-8 text-sm" />
                                    <Button size="sm" onClick={() => { if (newTagName.trim()) { addTagMutation.mutate(newTagName.trim()); setNewTagName('') } }} disabled={!newTagName.trim() || addTagMutation.isPending}>
                                        添加
                                    </Button>
                                </div>
                            )}
                            <Separator />
                            <p className="text-xs text-zinc-500">全局标签（点击添加）</p>
                            <div className="flex flex-wrap gap-1">
                                {tagOptions.map(tag => (
                                    <button key={tag.tagId} className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs hover:bg-zinc-100" onClick={() => addTagMutation.mutate(tag.name)} disabled={!canWrite}>
                                        + {tag.name}
                                    </button>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
