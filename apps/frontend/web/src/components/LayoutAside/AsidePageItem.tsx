import { Collapsible } from '@miaoma-doc/shadcn-shared-ui/components/ui/collapsible'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@miaoma-doc/shadcn-shared-ui/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { cn } from '@miaoma-doc/shadcn-shared-ui/lib/utils'
import { ArrowUpRight, MoreHorizontal, StarOff, Trash2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Page } from '@/types/page'

interface AsidePageItemProps {
    page: Page
    activePageId?: string
    isMobile: boolean
    onDelete: (pageId: string) => Promise<void>
}

export function AsidePageItem(props: AsidePageItemProps) {
    const { page, activePageId, isMobile, onDelete } = props

    return (
        <Collapsible key={page.pageId}>
            <SidebarMenuItem key={page.pageId}>
                <SidebarMenuButton asChild className={cn(activePageId === page.pageId && 'bg-zinc-100 font-bold')}>
                    <NavLink to={`/doc/${page.pageId}`} title={page.title}>
                        <span className="text-lg">{page.emoji}</span>
                        <span className="text-xs">{page.title}</span>
                    </NavLink>
                </SidebarMenuButton>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                            <MoreHorizontal />
                            <span className="sr-only">More</span>
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align={isMobile ? 'end' : 'start'}
                    >
                        <DropdownMenuItem disabled>
                            <StarOff className="text-muted-foreground" />
                            <span>取消收藏</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <NavLink to={`/doc/${page.pageId}`} target="_blank">
                                <ArrowUpRight className="text-muted-foreground" />
                                <span>新标签打开</span>
                            </NavLink>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground"
                            onClick={() => {
                                void onDelete(page.pageId)
                            }}
                        >
                            <Trash2 />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </Collapsible>
    )
}
