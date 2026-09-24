/*
 *   Copyright (c) 2024 妙码学院 @Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */
import {
    defaultBlockSpecs,
    defaultInlineContentSpecs,
    defaultStyleSpecs,
    filterSuggestionItems,
    locales,
    MiaomaDocEditor,
    MiaomaDocSchema,
} from '@miaoma-doc/core'
import { DefaultReactSuggestionItem, SuggestionMenuController, useCreateMiaomaDoc } from '@miaoma-doc/react'
// import {} from '@miaoma-doc/react'
import { MiaomaDocView } from '@miaoma-doc/shadcn'

import { Mention } from '@/blocks/mention'

const schema = MiaomaDocSchema.create({
    inlineContentSpecs: {
        // built-in inline content specs
        ...defaultInlineContentSpecs,
        mention: Mention,
    },
    blockSpecs: {
        // built-in block specs
        ...defaultBlockSpecs,
    },
    styleSpecs: {
        // built-in style specs
        ...defaultStyleSpecs,
    },
})

const getMentionMenuItems = (editor: MiaomaDocEditor) => {
    const menus = [
        {
            icon: <span>👽</span>,
            title: 'heyi',
        },
        {
            icon: <span>🔭</span>,
            title: '妙码',
        },
        {
            icon: <span>🥤</span>,
            title: '小明',
        },
    ]
    return menus.map(menu => ({
        ...menu,
        onItemClick: () => {
            editor.insertInlineContent([
                {
                    // @ts-expect-error mention
                    type: 'mention',
                    props: {
                        id: 'heyi',
                        title: menu.title,
                        icon: menu.icon,
                    },
                },
                ' ',
            ])
        },
    })) as DefaultReactSuggestionItem[]
}

export function DocEditorDemo() {
    // tiptap editor
    // const editor = useEditor()   @tiptap/react
    const editor = useCreateMiaomaDoc({
        schema, // 整个编辑器的 schema
        dictionary: locales.zh, // 语言包
        initialContent: undefined, // 初始内容
    })
    return (
        <MiaomaDocView editor={editor}>
            <SuggestionMenuController
                triggerCharacter="@"
                getItems={async query => {
                    return filterSuggestionItems(getMentionMenuItems(editor as unknown as MiaomaDocEditor), query)
                }}
            />
        </MiaomaDocView>
    )
}
