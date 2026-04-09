import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupLabel,
    SidebarMenu,
} from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { Plus } from 'lucide-react'

import { Page } from '@/types/page'

import { AsidePageItem } from './AsidePageItem'

interface AsidePageListProps {
    pages: Page[]
    activePageId?: string
    isMobile: boolean
    onCreate: () => Promise<void>
    onDelete: (pageId: string) => Promise<void>
}

export function AsidePageList(props: AsidePageListProps) {
    const { pages, activePageId, isMobile, onCreate, onDelete } = props

    return (
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel className="flex flex-row justify-between">
                    <span>所有文档</span>
                    <SidebarGroupAction
                        onClick={() => {
                            void onCreate()
                        }}
                    >
                        <Plus />
                    </SidebarGroupAction>
                </SidebarGroupLabel>
                <SidebarMenu>
                    {pages.map(page => (
                        <AsidePageItem key={page.pageId} page={page} activePageId={activePageId} isMobile={isMobile} onDelete={onDelete} />
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
    )
}
