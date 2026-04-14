import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/popover'
import { useToast } from '@miaoma-doc/shadcn-shared-ui/hooks/use-toast'
import { Share2 } from 'lucide-react'
import { useMemo } from 'react'

import { buildDocShareLink } from './share-link'

interface SharePopoverProps {
    pageId?: string
}

export function SharePopover(props: SharePopoverProps) {
    const { pageId } = props
    const { toast } = useToast()

    const link = useMemo(() => buildDocShareLink(window.location.origin, pageId), [pageId])

    const copyLink = async () => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(link)
            } else {
                const input = document.createElement('input')
                input.value = link
                document.body.appendChild(input)
                input.select()
                document.execCommand('copy')
                document.body.removeChild(input)
            }

            toast({
                variant: 'success',
                title: 'Link copied',
            })
        } catch {
            toast({
                variant: 'destructive',
                title: 'Failed to copy link',
            })
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm">
                    <Share2 size={16} className="" />
                    Share
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
                <p className="text-xs mb-3 text-zinc-500">Signed-in users with this link can access the document.</p>
                <Input className="w-full h-8 bg-zinc-100 rounded-md" value={link} readOnly />
                <div className="mt-6 text-sm">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <div className="font-medium">Signed-in users</div>
                        <div className="text-xs text-zinc-500">Can view</div>
                    </div>
                    <div className="flex flex-row items-center justify-between mb-4">
                        <div className="font-medium">Document members</div>
                        <div className="text-xs text-zinc-500">Can edit</div>
                    </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => void copyLink()}>
                    Copy link
                </Button>
            </PopoverContent>
        </Popover>
    )
}
