import { SearchPageRes } from '@/types/api'
import { request } from '@/utils/request'

export const searchPages = async (params: { q?: string; tagId?: string; cursor?: string; limit?: number }): Promise<SearchPageRes> => {
    return await request.get('/search/pages', { params })
}
