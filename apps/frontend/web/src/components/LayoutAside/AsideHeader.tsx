import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { FileStack, Search, Waypoints } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function AsideHeader() {
    return (
        <SidebarHeader>
            <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-2">
                <a href="/" className="flex items-center gap-2 ">
                    <img className="w-8" src="/logo.png" />
                    <p className="font-semibold text-lg">妙码协同文档</p>
                </a>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <a>
                            <Search />
                            <span>搜索</span>
                        </a>
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
            </SidebarMenu>
        </SidebarHeader>
    )
}
