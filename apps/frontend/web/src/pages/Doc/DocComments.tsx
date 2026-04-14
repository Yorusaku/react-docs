import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

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

export function DocComments(props: DocCommentsProps) {
    const { pageId } = props
    const [content, setContent] = useState('')
    const [mentionText, setMentionText] = useState('')

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', pageId],
        enabled: !!pageId,
        queryFn: async () => (await srv.fetchComments(pageId)).data,
    })

    const refetchComments = async () => {
        await queryClient.invalidateQueries({ queryKey: ['comments', pageId] })
    }

    return (
        <div className="px-4 lg:px-[54px] pb-12">
            <div className="rounded border border-zinc-200 p-4">
                <h2 className="text-sm font-semibold mb-3">评论与 @提醒</h2>
                <div className="space-y-2">
                    <Input value={content} onChange={event => setContent(event.target.value)} placeholder="输入评论内容" />
                    <Input
                        value={mentionText}
                        onChange={event => setMentionText(event.target.value)}
                        placeholder="提及用户ID，多个用逗号分隔（如：2,3）"
                    />
                    <Button
                        size="sm"
                        onClick={async () => {
                            if (!content.trim()) {
                                return
                            }
                            await srv.createComment(pageId, {
                                content,
                                mentionUserIds: parseMentionIds(mentionText),
                            })
                            setContent('')
                            setMentionText('')
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
                                    <div className="text-xs text-zinc-500 mt-1">提及: {item.mentionUserIds.join(', ')}</div>
                                )}
                            </div>
                        ))}
                    {!isLoading && comments.length === 0 && <div className="text-sm text-zinc-500">暂无评论</div>}
                </div>
            </div>
        </div>
    )
}
