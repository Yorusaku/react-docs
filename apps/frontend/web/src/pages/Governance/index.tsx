import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import * as srv from '@/services'

export function GovernancePage() {
    const { data: policy, refetch: refetchPolicy } = useQuery({
        queryKey: ['retention-policy'],
        queryFn: async () => (await srv.fetchRetentionPolicy()).data,
    })
    const { data: orgData, refetch: refetchOrg } = useQuery({
        queryKey: ['org-mappings'],
        queryFn: async () => (await srv.fetchOrgMappings()).data,
    })

    const [snapshotDays, setSnapshotDays] = useState('30')
    const [trashDays, setTrashDays] = useState('30')
    const [auditDays, setAuditDays] = useState('90')

    const departments = orgData?.departments ?? []
    const users = orgData?.users ?? []
    const roleMappings = orgData?.roleMappings ?? []
    const positions = useMemo(() => roleMappings.map(item => item.position), [roleMappings])

    return (
        <SidebarInset>
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-700">Governance Center</h1>
                </div>

                <section className="rounded border border-zinc-200 p-4">
                    <h2 className="mb-2 font-semibold">Retention Policy</h2>
                    <p className="mb-3 text-xs text-zinc-500">Configure snapshot, trash, and audit retention days.</p>
                    <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <Input value={snapshotDays} onChange={event => setSnapshotDays(event.target.value)} placeholder="snapshot days" />
                        <Input value={trashDays} onChange={event => setTrashDays(event.target.value)} placeholder="trash days" />
                        <Input value={auditDays} onChange={event => setAuditDays(event.target.value)} placeholder="audit days" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={async () => {
                                await srv.updateRetentionPolicy({
                                    snapshotDays: Number(snapshotDays) || 30,
                                    trashDays: Number(trashDays) || 30,
                                    auditDays: Number(auditDays) || 90,
                                })
                                await refetchPolicy()
                            }}
                        >
                            Save
                        </Button>
                        <p className="text-xs text-zinc-500">
                            current: snapshot={policy?.snapshotDays ?? '-'} / trash={policy?.trashDays ?? '-'} / audit=
                            {policy?.auditDays ?? '-'}
                        </p>
                    </div>
                </section>

                <section className="rounded border border-zinc-200 p-4">
                    <h2 className="mb-2 font-semibold">Org Mapping</h2>
                    <p className="mb-3 text-xs text-zinc-500">Map department and position to default document access role.</p>
                    <div className="space-y-2">
                        {users.map(user => (
                            <div key={user.userId} className="rounded border border-zinc-100 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{user.username}</p>
                                        <p className="text-xs text-zinc-500">defaultRole: {user.defaultRole}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="rounded border border-zinc-200 bg-white px-2 text-sm"
                                            value={user.departmentId}
                                            onChange={async event => {
                                                await srv.updateOrgMapping({
                                                    userId: user.userId,
                                                    departmentId: event.target.value,
                                                })
                                                await refetchOrg()
                                            }}
                                        >
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="rounded border border-zinc-200 bg-white px-2 text-sm"
                                            value={user.position}
                                            onChange={async event => {
                                                await srv.updateOrgMapping({
                                                    userId: user.userId,
                                                    position: event.target.value,
                                                })
                                                await refetchOrg()
                                            }}
                                        >
                                            {positions.map(position => (
                                                <option key={position} value={position}>
                                                    {position}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {users.length === 0 && <p className="text-sm text-zinc-500">No org data.</p>}
                    </div>
                </section>
            </div>
        </SidebarInset>
    )
}
