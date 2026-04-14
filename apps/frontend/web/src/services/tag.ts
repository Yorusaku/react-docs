import { TagItem } from '@/types/api'
import { request } from '@/utils/request'

export const fetchTags = async (): Promise<{ data: TagItem[] }> => {
    return await request.get('/tags')
}

export const createTag = async (name: string): Promise<{ data: TagItem }> => {
    return await request.post('/tags', { name })
}

export const updateTag = async (tagId: string, name: string): Promise<{ data: TagItem }> => {
    return await request.patch(`/tags/${tagId}`, { name })
}

export const removeTag = async (tagId: string) => {
    return await request.delete(`/tags/${tagId}`)
}
