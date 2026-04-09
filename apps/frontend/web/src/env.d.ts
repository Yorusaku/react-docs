/*
 *   Copyright (c) 2024 妙码学院 @Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */

/// <reference types="vite/client" />

// 临时类型声明，解决 @miaoma-doc/react 未构建时的类型错误
declare module '@miaoma-doc/react' {
    export * from '@miaoma-doc/react'
}

// 修复 createReactInlineContentSpec 的类型
import type { FC } from 'react'
import type { InlineContentFromConfig, CustomInlineContentConfig, StyleSchema, Props } from '@miaoma-doc/core'

export function createReactInlineContentSpec<T extends CustomInlineContentConfig, S extends StyleSchema>(
    inlineContentConfig: T,
    inlineContentImplementation: {
        render: FC<{
            inlineContent: InlineContentFromConfig<T, S>
            updateInlineContent: (update: any) => void
            contentRef: (node: HTMLElement | null) => void
        }>
    }
): any
