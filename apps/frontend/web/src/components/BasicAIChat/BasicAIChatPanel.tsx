import { PartialBlock } from '@miaoma-doc/core'
import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { useToast } from '@miaoma-doc/shadcn-shared-ui/hooks/use-toast'
import { ArrowUp, Loader, Sparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import TextareaAutosize from 'react-textarea-autosize'

import * as srv from '@/services'

interface BasicAIChatPanelProps {
    onResponse?: (response: PartialBlock[]) => void
}

export function BasicAIChatPanel(props: BasicAIChatPanelProps) {
    const [keyword, setKeyword] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [conversationId, setConversationId] = useState('')
    const { toast } = useToast()

    const sendMessage = useCallback(async () => {
        const query = keyword.trim()
        if (!query || isGenerating) {
            return
        }

        setIsGenerating(true)
        try {
            const res = await srv.aiChat({
                query,
                conversationId,
            })
            setConversationId(res.data.conversationId)
            props.onResponse?.(res.data.blocks)
            setKeyword('')
        } catch {
            toast({
                variant: 'destructive',
                title: 'AI generation failed. Please retry.',
            })
        } finally {
            setIsGenerating(false)
        }
    }, [conversationId, isGenerating, keyword, props, toast])

    const ref = useHotkeys(
        'Enter',
        () => {
            void sendMessage()
        },
        {
            enableOnFormTags: true,
            preventDefault: true,
        }
    )

    return (
        <div className="flex p-2 bg-zinc-50 rounded-lg shadow-2xl border border-zinc-200">
            <div className="self-stretch px-2 mt-1">
                <Sparkles color="#6B45FF" size={18} />
            </div>
            <div className="flex flex-1 items-center justify-center outline-none">
                <TextareaAutosize
                    disabled={isGenerating}
                    ref={ref}
                    placeholder="Describe the topic you want to write about"
                    autoFocus
                    className="flex-1 outline-none px-2 resize-none bg-transparent text-sm items-stretch"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
            </div>
            {isGenerating ? (
                <div className="self-end">
                    <Loader size={20} color="#6B45FF" className="animate-spin" />
                </div>
            ) : (
                <Button size="sm" disabled={!keyword.trim() || isGenerating} className="self-end size-6" onClick={() => void sendMessage()}>
                    <ArrowUp />
                </Button>
            )}
        </div>
    )
}
