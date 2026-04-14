import '@miaoma-doc/shadcn/style.css'

import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Separator } from '@miaoma-doc/shadcn-shared-ui/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { SharePopover } from '@/components/SharePopover'
import * as srv from '@/services'
import { debounce } from '@/utils/debounce'
import { queryClient } from '@/utils/query-client'

import { AvatarList } from './AvatarList'
import { DocComments } from './DocComments'
import { DocEditor } from './DocEditor'
import { sanitizeTitleText } from './title-sanitize'

const wsProtocol = import.meta.env.VITE_WS_PROTOCOL ?? (window.location.protocol === 'https:' ? 'wss' : 'ws')
const wsHost = import.meta.env.VITE_WS_HOST ?? window.location.hostname
const wsPort = import.meta.env.VITE_WS_PORT ?? '8082'

interface YjsInstances {
    doc: Y.Doc | null
    provider: WebsocketProvider | null
}

export const Doc = () => {
    const params = useParams()
    const { data: page } = useQuery({
        queryKey: ['page', params?.id],
        queryFn: async () => {
            if (!params?.id) {
                return undefined
            }
            return (await srv.fetchPageDetail(params?.id)).data
        },
        enabled: !!params?.id,
    })

    const yjsInstancesRef = useRef<YjsInstances>({
        doc: null,
        provider: null,
    })

    const [remoteUsers, setRemoteUsers] = useState<Map<number, { name: string; color: string }>>(new Map())
    const [isReady, setIsReady] = useState(false)
    const [titleInput, setTitleInput] = useState('')

    useEffect(() => {
        setTitleInput(page?.title ?? '')
    }, [page?.title])

    const updateTitleDebounced = useMemo(() => {
        return debounce((nextTitle: string) => {
            if (!page?.pageId) {
                return
            }

            const title = sanitizeTitleText(nextTitle) || 'Untitled Document'
            void srv.updatePage({
                pageId: page.pageId,
                title,
            })
            void queryClient.invalidateQueries({ queryKey: ['pages'] })
            void queryClient.invalidateQueries({ queryKey: ['page', params?.id] })
        }, 400)
    }, [page?.pageId, params?.id])

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setTitleInput(value)
        void updateTitleDebounced(value)
    }

    const handleTitleBlur = () => {
        if (!page?.pageId) {
            return
        }

        const title = sanitizeTitleText(titleInput) || 'Untitled Document'
        setTitleInput(title)
        void srv.updatePage({
            pageId: page.pageId,
            title,
        })
        void queryClient.invalidateQueries({ queryKey: ['pages'] })
        void queryClient.invalidateQueries({ queryKey: ['page', params?.id] })
    }

    useEffect(() => {
        if (yjsInstancesRef.current.provider) {
            yjsInstancesRef.current.provider.destroy()
        }

        if (yjsInstancesRef.current.doc) {
            yjsInstancesRef.current.doc.destroy()
        }

        setRemoteUsers(new Map())
        setIsReady(false)

        if (page?.pageId) {
            const doc = new Y.Doc()
            const roomName = `miaoma-doc-${page.pageId}`
            const token = localStorage.getItem('token')
            const provider = new WebsocketProvider(`${wsProtocol}://${wsHost}:${wsPort}/doc-yjs`, roomName, doc, {
                connect: false,
                params: token ? { token } : {},
            })

            yjsInstancesRef.current = {
                doc,
                provider,
            }

            const randomColor = () => {
                return `#${Math.floor(Math.random() * 0xffffff)
                    .toString(16)
                    .padStart(6, '0')}`
            }

            provider.awareness.setLocalStateField('user', {
                name: `miaoma-${Math.random().toString(36).slice(2)}`,
                color: randomColor(),
            })

            const changeHandler = () => {
                const states = provider.awareness.getStates()
                const users = new Map<number, { name: string; color: string }>()

                for (const [key, value] of states) {
                    if (key === provider.awareness.clientID) {
                        continue
                    }
                    if (value?.user?.name && value?.user?.color) {
                        users.set(key, value.user)
                    }
                }

                setRemoteUsers(users)
            }

            provider.awareness.on('change', changeHandler)
            provider.connect()
            setIsReady(true)

            return () => {
                provider.awareness.off('change', changeHandler)
                provider.disconnect()
                provider.destroy()
                doc.destroy()
                setIsReady(false)
            }
        }

        return undefined
    }, [page?.pageId])

    return (
        <SidebarInset>
            <header className="flex flex-row justify-between items-center h-[52px] px-[16px] border-b border-b-zinc-100">
                <div className="flex flex-row items-center gap-2">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex flex-row flex-auto items-center text-sm">
                        <em className="mr-2">{page?.emoji}</em>
                        <p className="overflow-hidden whitespace-nowrap max-w-[300px] text-ellipsis" title={page?.title}>
                            {page?.title}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                    {remoteUsers.size > 0 && <AvatarList remoteUsers={remoteUsers} />}
                    {page?.pageId && (
                        <Button asChild size="sm" variant="outline">
                            <Link to={`/doc/${page.pageId}/acl`}>权限</Link>
                        </Button>
                    )}
                    <SharePopover pageId={page?.pageId} />
                </div>
            </header>
            <div className="w-[90%] lg:w-[60%] mx-auto">
                <h1 className="flex flex-row py-12 px-4 lg:px-[54px] leading-[3.25rem] text-4xl font-bold">
                    <span className="mr-4">{page?.emoji}</span>
                    <input
                        value={titleInput}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        maxLength={255}
                        className="inline-block flex-1 outline-none bg-transparent"
                        placeholder="Untitled Document"
                    />
                </h1>
                {isReady && page?.pageId && yjsInstancesRef.current.doc && yjsInstancesRef.current.provider && (
                    <DocEditor
                        key={page.pageId}
                        pageId={page.pageId}
                        doc={yjsInstancesRef.current.doc}
                        provider={yjsInstancesRef.current.provider}
                    />
                )}
                {page?.pageId && <DocComments pageId={page.pageId} />}
            </div>
        </SidebarInset>
    )
}
