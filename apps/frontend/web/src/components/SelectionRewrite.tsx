import type { MiaomaDocEditor } from '@miaoma-doc/core'
import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Check, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { aiRewrite } from '@/services/ai'
import type { AiRewritePayload } from '@/types/api'

type SelectionSnapshot = { from: number; to: number; text: string; doc: unknown; x: number; y: number }

export function SelectionRewrite({ editor, pageId }: { editor: MiaomaDocEditor<any, any, any>; pageId: string }) {
    const [selection, setSelection] = useState<SelectionSnapshot | null>(null)
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(
        () =>
            editor.onSelectionChange(() => {
                if (loading || result) return
                const view = editor.prosemirrorView
                const { from, to, $from, $to } = view.state.selection
                if (from === to || $from.parent !== $to.parent || !['paragraph', 'heading'].includes($from.parent.type.name)) {
                    setSelection(null)
                    return
                }
                let hasSpecialContent = false
                view.state.doc.nodesBetween(from, to, node => {
                    if (node.isInline && (!node.isText || node.marks.length > 0)) hasSpecialContent = true
                })
                const text = view.state.doc.textBetween(from, to, '')
                if (hasSpecialContent || !text.trim() || text.length > 4000 || text.length !== to - from) {
                    setSelection(null)
                    return
                }
                const coords = view.coordsAtPos(to)
                setError('')
                setSelection({
                    from,
                    to,
                    text,
                    doc: view.state.doc,
                    x: Math.min(coords.left, window.innerWidth - 290),
                    y: Math.min(coords.bottom + 8, window.innerHeight - 190),
                })
            }),
        [editor, loading, result]
    )

    const dismiss = () => {
        setSelection(null)
        setResult('')
        setError('')
    }
    const generate = async (action: AiRewritePayload['action']) => {
        if (!selection || loading) return
        setLoading(true)
        setError('')
        try {
            const response = await aiRewrite({ pageId, action, text: selection.text })
            if (editor.prosemirrorView.state.doc !== selection.doc) {
                setError('文档已变化，请重新选择文本')
                return
            }
            setResult(response.data.text)
        } catch {
            setError('生成失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }
    const accept = () => {
        if (!selection || !result) return
        const view = editor.prosemirrorView
        if (view.state.doc !== selection.doc) {
            setError('文档已变化，请重新选择文本')
            setResult('')
            return
        }
        editor.dispatch(view.state.tr.insertText(result, selection.from, selection.to))
        dismiss()
    }

    const selectionIsStale = error.startsWith('文档已变化')

    if (!selection) return null
    return (
        <div
            className="fixed z-50 w-[280px] border border-zinc-200 bg-white p-2 shadow-lg"
            style={{ left: Math.max(8, selection.x), top: Math.max(8, selection.y) }}
            onMouseDown={event => event.preventDefault()}
        >
            <div className="flex items-center gap-1">
                <Sparkles size={16} className="mr-1 text-emerald-700" />
                <Button size="sm" variant="ghost" disabled={loading || selectionIsStale} onClick={() => void generate('polish')}>
                    润色
                </Button>
                <Button size="sm" variant="ghost" disabled={loading || selectionIsStale} onClick={() => void generate('shorten')}>
                    精简
                </Button>
                <Button size="icon" variant="ghost" title="关闭" aria-label="关闭" className="ml-auto h-7 w-7" onClick={dismiss}>
                    <X size={15} />
                </Button>
            </div>
            {loading && <p className="py-2 text-sm text-zinc-500">生成中...</p>}
            {result && (
                <div className="mt-2 border-t pt-2">
                    <p className="max-h-32 overflow-auto whitespace-pre-wrap text-sm">{result}</p>
                    <Button size="sm" className="mt-2" onClick={accept}>
                        <Check size={15} className="mr-1" />
                        采用
                    </Button>
                </div>
            )}
            {error && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    )
}
