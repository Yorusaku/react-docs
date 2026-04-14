import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { Bell, FileStack, Search, Trash2, Waypoints } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function AsideHeader() {
    return (
        <SidebarHeader>
            <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-2">
                <a href="/" className="flex items-center gap-2">
                    <img className="w-8" src="/logo.png" />
                    <p className="font-semibold text-lg">妙码协同文档</p>
                </a>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <NavLink to="/search">
                            <Search />
                            <span>搜索</span>
                        </NavLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <NavLink to="/doc">
                            <FileStack />
                            <span>全部文档</span>
                        </NavLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <NavLink to="/doc/graph">
                            <Waypoints />
                            <span>文档图谱</span>
                        </NavLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <NavLink to="/notifications">
                            <Bell />
                            <span>通知中心</span>
                        </NavLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <NavLink to="/trash">
                            <Trash2 />
                            <span>回收站</span>
                        </NavLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
    )
}
