import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import * as srv from '@/services'
import { SearchPageItem } from '@/types/api'

export function SearchPage() {
    const [keyword, setKeyword] = useState('')
    const [items, setItems] = useState<SearchPageItem[]>([])
    const [loading, setLoading] = useState(false)

    const onSearch = async () => {
        setLoading(true)
        try {
            const result = await srv.searchPages({ q: keyword, limit: 30 })
            setItems(result.data.items)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SidebarInset>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-700">搜索与发现</h1>
                </div>

                <div className="flex gap-2 mb-4">
                    <Input
                        value={keyword}
                        onChange={event => setKeyword(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                void onSearch()
                            }
                        }}
                        placeholder="输入标题/正文关键词"
                    />
                    <Button onClick={() => void onSearch()} disabled={loading}>
                        {loading ? '搜索中...' : '搜索'}
                    </Button>
                </div>

                <div className="space-y-2">
                    {items.map(item => (
                        <Link
                            key={item.pageId}
                            to={`/doc/${item.pageId}`}
                            className="block rounded border border-zinc-200 p-3 hover:bg-zinc-50"
                        >
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-zinc-500">更新时间：{new Date(item.updatedAt).toLocaleString()}</div>
                        </Link>
                    ))}
                    {!loading && items.length === 0 && <div className="text-sm text-zinc-500">暂无结果</div>}
                </div>
            </div>
        </SidebarInset>
    )
}
