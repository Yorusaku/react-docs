import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import * as srv from '@/services'
import { queryClient } from '@/utils/query-client'

interface DocCommentsProps {
    pageId: string
}

const parseMentionIds = (value: string) =>
    value
        .split(',')
        .map(item => Number(item.trim()))
        .filter(item => Number.isInteger(item) && item > 0)

const parseMentionNames = (value: string) =>
    value
        .split(',')
        .map(item => item.trim().replace(/^@+/, ''))
        .filter(Boolean)

const extractMentionNamesFromContent = (content: string) => {
    const matches = content.match(/@([A-Za-z0-9_\-\u4e00-\u9fa5]+)/g) ?? []
    return matches.map(item => item.replace(/^@+/, '').trim()).filter(Boolean)
}

export function DocComments(props: DocCommentsProps) {
    const { pageId } = props
    const [content, setContent] = useState('')
    const [mentionText, setMentionText] = useState('')
    const [anchorText, setAnchorText] = useState('')

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', pageId],
        enabled: !!pageId,
        queryFn: async () => (await srv.fetchComments(pageId)).data,
    })
    const { data: users = [] } = useQuery({
        queryKey: ['user-list'],
        queryFn: async () => (await srv.listUsers()).data,
    })

    const userMap = useMemo(() => {
        const map = new Map<string, number>()
        for (const user of users) {
            map.set(user.username, user.id)
        }
        return map
    }, [users])

    const refetchComments = async () => {
        await queryClient.invalidateQueries({ queryKey: ['comments', pageId] })
    }

    const parseAnchor = () => {
        if (!anchorText.trim()) {
            return undefined
        }
        try {
            const parsed = JSON.parse(anchorText)
            return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : undefined
        } catch {
            return undefined
        }
    }

    return (
        <div className="px-4 lg:px-[54px] pb-12">
            <div className="rounded border border-zinc-200 p-4">
                <h2 className="text-sm font-semibold mb-3">评论与提醒</h2>
                <div className="space-y-2">
                    <Input
                        value={content}
                        onChange={event => setContent(event.target.value)}
                        placeholder="输入评论内容，可直接 @username"
                    />
                    <Input
                        value={mentionText}
                        onChange={event => setMentionText(event.target.value)}
                        placeholder="补充提及用户名，逗号分隔（如 @demo,@manager）"
                    />
                    <Input
                        value={anchorText}
                        onChange={event => setAnchorText(event.target.value)}
                        placeholder='可选锚点 JSON（如 {"blockId":"b1","from":0,"to":12}）'
                    />
                    <Button
                        size="sm"
                        onClick={async () => {
                            const normalizedContent = content.trim()
                            if (!normalizedContent) {
                                return
                            }
                            const mentionNames = Array.from(
                                new Set([...parseMentionNames(mentionText), ...extractMentionNamesFromContent(normalizedContent)])
                            )
                            const mentionUserIdsByName = mentionNames
                                .map(name => userMap.get(name))
                                .filter((item): item is number => typeof item === 'number')
                            const mentionUserIds = Array.from(new Set([...mentionUserIdsByName, ...parseMentionIds(mentionText)]))

                            await srv.createComment(pageId, {
                                content: normalizedContent,
                                mentionUserIds,
                                mentions: mentionNames,
                                anchor: parseAnchor(),
                            })
                            setContent('')
                            setMentionText('')
                            setAnchorText('')
                            await refetchComments()
                        }}
                    >
                        发表评论
                    </Button>
                </div>

                <div className="mt-4 space-y-2">
                    {isLoading && <div className="text-sm text-zinc-500">评论加载中...</div>}
                    {!isLoading &&
                        comments.map(item => (
                            <div key={item.commentId} className="rounded bg-zinc-50 p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="text-xs text-zinc-500">
                                        {item.author?.username ?? 'unknown'} · {new Date(item.createdAt).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={async () => {
                                                await srv.updateComment(item.commentId, { resolved: !item.resolved })
                                                await refetchComments()
                                            }}
                                        >
                                            {item.resolved ? '取消解决' : '标记解决'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={async () => {
                                                await srv.removeComment(item.commentId)
                                                await refetchComments()
                                            }}
                                        >
                                            删除
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm">{item.content}</p>
                                {item.mentionUserIds.length > 0 && (
                                    <div className="text-xs text-zinc-500 mt-1">提及用户ID: {item.mentionUserIds.join(', ')}</div>
                                )}
                            </div>
                        ))}
                    {!isLoading && comments.length === 0 && <div className="text-sm text-zinc-500">暂无评论</div>}
                </div>
            </div>
        </div>
    )
}
