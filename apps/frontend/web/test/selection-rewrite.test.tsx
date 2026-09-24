// @vitest-environment jsdom

import { MiaomaDocEditor } from '@miaoma-doc/core'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SelectionRewrite } from '@/components/SelectionRewrite'
import { aiRewrite } from '@/services/ai'

vi.mock('@/services/ai', () => ({ aiRewrite: vi.fn() }))

const createEditor = () => {
    let selectionChanged = () => {}
    const paragraph = { type: { name: 'paragraph' } }
    const doc = {
        nodesBetween: (_from: number, _to: number, callback: (node: { isInline: boolean; isText: boolean; marks: unknown[] }) => void) =>
            callback({ isInline: true, isText: true, marks: [] }),
        textBetween: () => '原文',
    }
    const transaction = { insertText: vi.fn().mockReturnValue('replacement-transaction') }
    const view = {
        state: { selection: { from: 1, to: 3, $from: { parent: paragraph }, $to: { parent: paragraph } }, doc, tr: transaction },
        coordsAtPos: () => ({ left: 20, bottom: 20 }),
    }
    const dispatch = vi.fn()
    const editor = {
        prosemirrorView: view,
        onSelectionChange: (callback: () => void) => {
            selectionChanged = callback
            return () => {}
        },
        dispatch,
    } as unknown as MiaomaDocEditor<any, any, any>
    return { editor, view, dispatch, transaction, select: () => act(() => selectionChanged()) }
}

describe('SelectionRewrite', () => {
    beforeEach(() => vi.mocked(aiRewrite).mockReset())

    it('previews a result and leaves document unchanged when dismissed', async () => {
        vi.mocked(aiRewrite).mockResolvedValue({ data: { text: '新文' } } as Awaited<ReturnType<typeof aiRewrite>>)
        const subject = createEditor()
        render(<SelectionRewrite editor={subject.editor} pageId="page-1" />)
        subject.select()
        fireEvent.click(screen.getByRole('button', { name: '润色' }))
        expect(await screen.findByText('新文')).toBeTruthy()
        expect(subject.dispatch).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: '关闭' }))
        expect(screen.queryByText('新文')).toBeNull()
        expect(subject.dispatch).not.toHaveBeenCalled()
    })

    it('replaces exactly the selected range after confirmation', async () => {
        vi.mocked(aiRewrite).mockResolvedValue({ data: { text: '新文' } } as Awaited<ReturnType<typeof aiRewrite>>)
        const subject = createEditor()
        render(<SelectionRewrite editor={subject.editor} pageId="page-1" />)
        subject.select()
        fireEvent.click(screen.getByRole('button', { name: '精简' }))
        await screen.findByText('新文')
        expect(aiRewrite).toHaveBeenCalledWith({ pageId: 'page-1', action: 'shorten', text: '原文' })
        fireEvent.click(screen.getByRole('button', { name: '采用' }))
        expect(subject.transaction.insertText).toHaveBeenCalledWith('新文', 1, 3)
        expect(subject.dispatch).toHaveBeenCalledWith('replacement-transaction')
    })

    it('rejects a stale result when the document changes during generation', async () => {
        let finish!: (value: Awaited<ReturnType<typeof aiRewrite>>) => void
        vi.mocked(aiRewrite).mockReturnValue(
            new Promise(resolve => {
                finish = resolve
            })
        )
        const subject = createEditor()
        render(<SelectionRewrite editor={subject.editor} pageId="page-1" />)
        subject.select()
        fireEvent.click(screen.getByRole('button', { name: '润色' }))
        subject.view.state.doc = { ...subject.view.state.doc }
        await act(async () => finish({ data: { text: '过期结果' } } as Awaited<ReturnType<typeof aiRewrite>>))
        await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('重新选择文本'))
        expect(screen.queryByText('过期结果')).toBeNull()
        expect(subject.dispatch).not.toHaveBeenCalled()
    })
})
