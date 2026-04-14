import { Sidebar } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'

import { AsideFooter } from './AsideFooter'
import { AsideHeader } from './AsideHeader'
import { AsidePageList } from './AsidePageList'
import { useAsideData } from './useAsideData'

export function Aside() {
    const {
        pages,
        currentUser,
        activePageId,
        isMobile,
        handleCreate,
        handleDelete,
        handleConfetti,
        handleOpenSettings,
        handleOpenAbout,
        handleLogout,
    } = useAsideData()

    return (
        <Sidebar variant="inset">
            <AsideHeader />
            <AsidePageList pages={pages} activePageId={activePageId} isMobile={isMobile} onCreate={handleCreate} onDelete={handleDelete} />
            <AsideFooter
                currentUser={currentUser}
                onConfetti={handleConfetti}
                onOpenSettings={handleOpenSettings}
                onOpenAbout={handleOpenAbout}
                onLogout={handleLogout}
            />
        </Sidebar>
    )
}
