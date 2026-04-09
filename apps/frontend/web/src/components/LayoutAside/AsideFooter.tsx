import { Avatar, AvatarFallback, AvatarImage } from '@miaoma-doc/shadcn-shared-ui/components/ui/avatar'
import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { MessageCircleQuestion, Settings } from 'lucide-react'

import { User } from '@/types/api'

interface AsideFooterProps {
    currentUser?: User
    onConfetti: () => void
    onLogout: () => void
}

export function AsideFooter(props: AsideFooterProps) {
    const { currentUser, onConfetti, onLogout } = props

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
                                    <span className="text-lg">{currentUser.username}！</span>
                                    庆祝一下 🎉
                                </p>
                            </>
                        )}
                    </Button>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <Settings />
                        设置
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <MessageCircleQuestion />
                        关于
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={onLogout}>
                        退出登录
                    </Button>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    )
}
