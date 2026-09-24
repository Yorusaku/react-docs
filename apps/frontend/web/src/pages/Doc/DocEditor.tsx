/*
 *   Copyright (c) 2024 妙码学院 @Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */
import '@miaoma-doc/shadcn/style.css'

import {
    defaultBlockSpecs,
    defaultInlineContentSpecs,
    filterSuggestionItems,
    locales,
    MiaomaDocEditor,
    MiaomaDocSchema,
    PartialBlock,
} from '@miaoma-doc/core'
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateMiaomaDoc } from '@miaoma-doc/react'
import { MiaomaDocView } from '@miaoma-doc/shadcn'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
// import { yXmlFragmentToProseMirrorFragment, yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { Mention } from '@/blocks/mention'
import { SelectionRewrite } from '@/components/SelectionRewrite'
import * as srv from '@/services'
import { User } from '@/types/api'

import { cursorRender } from './cursorRender'

interface DocEditorProps {
    pageId: string
    canWrite: boolean
    initialContent?: PartialBlock[]
    doc: Y.Doc
    provider: WebsocketProvider
}

const schema = MiaomaDocSchema.create({
    inlineContentSpecs: {
        ...defaultInlineContentSpecs,
        mention: Mention,
    },
    blockSpecs: {
        ...defaultBlockSpecs,
    },
})

// Function which gets all users for the mentions menu.
const getMentionMenuItems = async (editor: MiaomaDocEditor, pageId?: string): Promise<DefaultReactSuggestionItem[]> => {
    const items: DefaultReactSuggestionItem[] = []
    // 获取远程页面
    const res = await srv.fetchPageList()
    const pages = res.data.pages

    for (const page of pages) {
        if (page.pageId !== pageId) {
            items.push({
                icon: <span>{page.emoji}</span>,
                title: page.title,
                onItemClick: () => {
                    editor.insertInlineContent([
                        {
                            // @ts-expect-error mention type
                            type: 'mention',
                            props: {
                                id: page.pageId,
                                title: page.title,
                                icon: page.emoji,
                            },
                        },
                        ' ', // add a space after the mention
                    ])
                },
            })
        }
    }

    return items
}

export function DocEditor(props: DocEditorProps) {
    const { pageId, doc, provider, canWrite } = props

    const { data: currentUser } = useQuery<User>({
        queryKey: ['currentUser'],
    })

    const randomColor = useMemo(() => {
        const storedColor = sessionStorage.getItem('miaomadoc-user-color')
        if (storedColor) {
            return storedColor
        }
        const r = Math.floor(Math.random() * 256)
        const g = Math.floor(Math.random() * 256)
        const b = Math.floor(Math.random() * 256)
        const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        sessionStorage.setItem('miaomadoc-user-color', color)
        return color
    }, [])

    const getMentionItems = useCallback(
        async (query: string) => {
            const items = await getMentionMenuItems(editor as unknown as MiaomaDocEditor, pageId)
            return filterSuggestionItems(items, query)
        },
        [pageId]
    )

    const getSlashItems = useCallback(async (query: string) => {
        return filterSuggestionItems(getDefaultReactSlashMenuItems(editor as unknown as MiaomaDocEditor), query)
    }, [])

    const editor = useCreateMiaomaDoc(
        {
            schema,
            dictionary: locales.zh,
            collaboration: {
                provider,
                fragment: doc.getXmlFragment(`document-store-${pageId}`),
                user: {
                    name: currentUser?.username ?? '',
                    color: randomColor,
                },
                renderCursor: cursorRender,
            },
        },
        [pageId, provider, doc, currentUser]
    )

    useEffect(() => {
        // 借鉴了 ssr 的实现：https://github.com/TypeCellOS/BlockNote/blob/main/packages/server-util/src/context/ServerBlockNoteEditor.ts
        // const json = yXmlFragmentToProseMirrorFragment(doc.getXmlFragment(`document-store-${pageId}`), editor.pmSchema)
        // // console.log('🚀 ~ useEffect ~ json:', json)
        // console.log('🚀 ~ useEffect ~ json:', editor.document)
    }, [])

    return (
        <MiaomaDocView editor={editor} theme="light" slashMenu={false} editable={canWrite}>
            <SuggestionMenuController triggerCharacter="@" getItems={getMentionItems} />
            <SuggestionMenuController triggerCharacter="/" getItems={getSlashItems} />
            {canWrite && <SelectionRewrite editor={editor} pageId={pageId} />}
        </MiaomaDocView>
    )
}
