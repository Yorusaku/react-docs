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
    const activePageId = useMatch('/doc/:id')?.params?.id
    const { toast } = useToast()
    const { isMobile } = useSidebar()

    // Sidebar 的数据源：文档列表
    const { data: pages = [], refetch: refetchPages } = useQuery<Page[]>({
        queryKey: ['pages'],
        queryFn: async () => {
            return (await srv.fetchPageList()).data.pages
        },
    })

    // 当前登录用户信息，供 Footer 展示
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
            title: '未命名文档@妙码学院-合一',
        })
        navigate(`/doc/${res.data.pageId}`)
        await refetchPages()
    }

    const handleDelete = async (pageId: string) => {
        await srv.removePage(pageId)
        await refetchPages()

        // 如果删的是当前打开文档，回退到列表页，避免落在无效路由
        if (activePageId === pageId) {
            navigate('/doc')
        }
    }

    const handleConfetti = () => {
        miaoConfetti.firework()
    }

    const handleLogout = () => {
        toast({ title: '退出登录' })
        localStorage.removeItem('token')
        navigate(`/account/login?redirect=${window.location.pathname}`)
    }

    return {
        pages,
        currentUser,
        activePageId,
        isMobile,
        handleCreate,
        handleDelete,
        handleConfetti,
        handleLogout,
    }
}
