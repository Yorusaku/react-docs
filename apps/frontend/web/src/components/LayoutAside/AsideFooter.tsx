import { Avatar, AvatarFallback, AvatarImage } from '@miaoma-doc/shadcn-shared-ui/components/ui/avatar'
import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { MessageCircleQuestion, Settings } from 'lucide-react'

import { User } from '@/types/api'

interface AsideFooterProps {
    currentUser?: User
    onConfetti: () => void
    onOpenSettings: () => void
    onOpenAbout: () => void
    onLogout: () => void
}

export function AsideFooter(props: AsideFooterProps) {
    const { currentUser, onConfetti, onOpenSettings, onOpenAbout, onLogout } = props

    return (
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-fit flex justify-start gap-3 rounded-lg px-2 py-1 text-muted-foreground transition-all hover:text-primary"
                        onClick={onConfetti}
                    >
                        {currentUser && (
                            <>
                                <Avatar>
                                    <AvatarImage src={`https://robohash.org/${currentUser.username}?set=set1&size=100x100`} />
                                    <AvatarFallback>{currentUser.username}</AvatarFallback>
                                </Avatar>
                                <p className="text-left">
                                    <span className="text-lg">{currentUser.username}, </span>
                                    celebrate a little ??
                                </p>
                            </>
                        )}
                    </Button>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={onOpenSettings}>
                        <Settings />
                        Settings
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={onOpenAbout}>
                        <MessageCircleQuestion />
                        About
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={onLogout}>
                        Logout
                    </Button>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    )
}
