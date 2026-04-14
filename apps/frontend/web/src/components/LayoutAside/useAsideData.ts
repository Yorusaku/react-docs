import { useSidebar } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useToast } from '@miaoma-doc/shadcn-shared-ui/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { useMatch, useNavigate } from 'react-router-dom'

import * as srv from '@/services'
import { User } from '@/types/api'
import { Page } from '@/types/page'
import { miaoConfetti } from '@/utils/miao-confetti'
import { randomEmoji } from '@/utils/randomEmoji'

export function useAsideData() {
    const navigate = useNavigate()
    const activeDocPageId = useMatch('/doc/:id')?.params?.id
    const activeAclPageId = useMatch('/doc/:id/acl')?.params?.id
    const activePageId = activeDocPageId ?? activeAclPageId
    const { toast } = useToast()
    const { isMobile } = useSidebar()

    const { data: pages = [], refetch: refetchPages } = useQuery<Page[]>({
        queryKey: ['pages'],
        queryFn: async () => {
            return (await srv.fetchPageList()).data.pages
        },
    })

    const { data: currentUser } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const res = await srv.currentUser()
            return res.data
        },
    })

    const handleCreate = async () => {
        const res = await srv.createPage({
            emoji: randomEmoji(),
            title: 'Untitled Document',
        })
        navigate(`/doc/${res.data.pageId}`)
        await refetchPages()
    }

    const handleDelete = async (pageId: string) => {
        await srv.removePage(pageId)
        await refetchPages()

        if (activePageId === pageId) {
            navigate('/doc')
        }
    }

    const handleConfetti = () => {
        miaoConfetti.firework()
    }

    const handleOpenSettings = () => {
        toast({
            title: 'Settings is not available yet',
            description: 'This entry is reserved for upcoming internal settings.',
        })
    }

    const handleOpenAbout = () => {
        toast({
            title: 'About Miaoma Docs',
            description: 'Current build is for internal rollout and validation.',
        })
    }

    const handleLogout = async () => {
        try {
            await srv.logout()
        } catch {
            // stateless jwt logout is best-effort on the client side
        } finally {
            toast({ title: 'Logged out' })
            localStorage.removeItem('token')
            navigate(`/account/login?redirect=${window.location.pathname}`)
        }
    }

    return {
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
    }
}
