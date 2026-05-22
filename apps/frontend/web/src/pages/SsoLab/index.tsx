import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useToast } from '@miaoma-doc/shadcn-shared-ui/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'

import * as srv from '@/services'

export function SsoLabPage() {
    const { toast } = useToast()
    const { data: providers = [], isLoading } = useQuery({
        queryKey: ['sso-providers'],
        queryFn: async () => (await srv.fetchSsoProviders()).data,
    })

    const startSso = async (provider: 'wechat-work' | 'dingtalk') => {
        const started = await srv.startSsoSimulation(provider)
        const callback = await srv.completeSsoSimulation(provider, started.data.code)
        localStorage.setItem('token', callback.data.access_token)
        toast({
            variant: 'success',
            title: `SSO 登录成功：${callback.data.user.username}`,
            description: `Provider: ${provider}`,
        })
    }

    return (
        <SidebarInset>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-700">SSO 模拟实验室</h1>
                </div>
                <p className="text-sm text-zinc-500 mb-4">用于演示“企业微信/钉钉 SSO 回调 + 用户映射”的业务流程，当前为 Mock 驱动。</p>

                {isLoading && <p className="text-sm text-zinc-500">加载中...</p>}
                {!isLoading && (
                    <div className="grid gap-3 max-w-xl">
                        {providers.map(item => (
                            <div key={item.key} className="rounded border border-zinc-200 p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-zinc-500">provider key: {item.key}</p>
                                </div>
                                <Button size="sm" onClick={() => void startSso(item.key)}>
                                    模拟授权并登录
                                </Button>
                            </div>
                        ))}
                        {providers.length === 0 && <p className="text-sm text-zinc-500">暂无可用 SSO Provider</p>}
                    </div>
                )}
            </div>
        </SidebarInset>
    )
}
