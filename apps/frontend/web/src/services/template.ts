import { TemplateItem } from '@/types/api'
import { request } from '@/utils/request'

export const fetchTemplates = async (): Promise<{ data: TemplateItem[] }> => {
    return await request.get('/templates')
}

export const createTemplate = async (payload: { name: string; emoji: string; title: string; description?: string }) => {
    return await request.post('/templates', payload)
}

export const createTemplateFromPage = async (pageId: string) => {
    return await request.post(`/templates/from-page/${pageId}`)
}

export const updateTemplate = async (
    templateId: string,
    payload: { name?: string; emoji?: string; title?: string; description?: string | null }
) => {
    return await request.patch(`/templates/${templateId}`, payload)
}

export const removeTemplate = async (templateId: string) => {
    return await request.delete(`/templates/${templateId}`)
}
