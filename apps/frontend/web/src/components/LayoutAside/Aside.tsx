import { Sidebar } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'

import { AsideFooter } from './AsideFooter'
import { AsideHeader } from './AsideHeader'
import { AsidePageList } from './AsidePageList'
import { useAsideData } from './useAsideData'

export function Aside() {
    // Aside 只做装配，把“数据/行为”和“视图渲染”解耦。
    const { pages, currentUser, activePageId, isMobile, handleCreate, handleDelete, handleConfetti, handleLogout } = useAsideData()

    return (
        <Sidebar variant="inset">
            <AsideHeader />
            <AsidePageList pages={pages} activePageId={activePageId} isMobile={isMobile} onCreate={handleCreate} onDelete={handleDelete} />
            <AsideFooter currentUser={currentUser} onConfetti={handleConfetti} onLogout={handleLogout} />
        </Sidebar>
    )
}
