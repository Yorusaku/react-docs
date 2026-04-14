import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import * as srv from '@/services'
import { DocOperation, DocRole } from '@/types/api'

const roles: DocRole[] = ['owner', 'editor', 'commenter', 'viewer']
const operations: DocOperation[] = [
    'share',
    'member_manage',
    'delete',
    'restore',
    'export',
    'comment_moderate',
    'template_manage',
    'invite_user',
]

export function DocAclPage() {
    const { id } = useParams()
    const pageId = id ?? ''

    const [username, setUsername] = useState('')
    const [role, setRole] = useState<DocRole>('viewer')

    const { data: members = [], refetch } = useQuery({
        queryKey: ['page-acl', pageId],
        enabled: !!pageId,
        queryFn: async () => (await srv.fetchPageAcl(pageId)).data,
    })

    const ownerCount = useMemo(() => members.filter(member => member.role === 'owner').length, [members])

    return (
        <SidebarInset>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-700">文档权限设置</h1>
                </div>
                <div className="rounded border border-zinc-200 p-4 mb-4">
                    <p className="text-sm text-zinc-500 mb-2">邀请成员</p>
                    <div className="flex gap-2">
                        <Input value={username} onChange={event => setUsername(event.target.value)} placeholder="输入用户名" />
                        <select
                            value={role}
                            onChange={event => setRole(event.target.value as DocRole)}
                            className="border border-zinc-200 rounded px-2 text-sm bg-white"
                        >
                            {roles.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        <Button
                            onClick={async () => {
                                if (!username.trim()) {
                                    return
                                }
                                await srv.invitePageMember(pageId, { username: username.trim(), role, operations: [] })
                                setUsername('')
                                await refetch()
                            }}
                        >
                            邀请
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    {members.map(member => (
                        <div key={member.userId} className="rounded border border-zinc-200 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="font-medium">{member.username}</div>
                                    <div className="text-xs text-zinc-500">userId: {member.userId}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={member.role}
                                        onChange={async event => {
                                            const nextRole = event.target.value as DocRole
                                            await srv.updatePageAcl(
                                                pageId,
                                                members.map(item => ({
                                                    userId: item.userId,
                                                    role: item.userId === member.userId ? nextRole : item.role,
                                                    operations: item.operations,
                                                }))
                                            )
                                            await refetch()
                                        }}
                                        className="border border-zinc-200 rounded px-2 text-sm bg-white"
                                    >
                                        {roles.map(item => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={member.role === 'owner' && ownerCount <= 1}
                                        onClick={async () => {
                                            await srv.removePageMember(pageId, member.userId)
                                            await refetch()
                                        }}
                                    >
                                        移除
                                    </Button>
                                </div>
                            </div>
                            <div className="text-xs text-zinc-500">
                                操作位：{member.operations.length ? member.operations.join(', ') : '无'}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {operations.map(op => {
                                    const checked = member.operations.includes(op)
                                    return (
                                        <label key={op} className="text-xs flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={async event => {
                                                    const nextOps = event.target.checked
                                                        ? [...member.operations, op]
                                                        : member.operations.filter(item => item !== op)
                                                    await srv.updatePageAcl(
                                                        pageId,
                                                        members.map(item => ({
                                                            userId: item.userId,
                                                            role: item.role,
                                                            operations: item.userId === member.userId ? nextOps : item.operations,
                                                        }))
                                                    )
                                                    await refetch()
                                                }}
                                            />
                                            {op}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SidebarInset>
    )
}
