import { CreatePagePayload, DocAclPolicy, PageGraphRes, PageListRes, SnapshotItem, TagItem, UpdatePagePayload } from '@/types/api'
import { request } from '@/utils/request'

export const fetchPageList = async (): Promise<PageListRes> => {
    return await request.get('/page')
}

export const fetchTrashPageList = async (): Promise<PageListRes> => {
    return await request.get('/page/trash')
}

export const fetchPageDetail = async (pageId: string) => {
    return await request.get(`/page/${pageId}`)
}

export const removePage = async (pageId: string) => {
    return await request.delete('/page', { data: { pageId } })
}

export const restorePage = async (pageId: string) => {
    return await request.post(`/page/${pageId}/restore`)
}

export const permanentDeletePage = async (pageId: string) => {
    return await request.delete(`/page/${pageId}/permanent`)
}

export const createPage = async (data: CreatePagePayload) => {
    return await request.post('/page', data)
}

export const createPageFromTemplate = async (templateId: string) => {
    return await request.post(`/page/from-template/${templateId}`)
}

export const updatePage = async (data: UpdatePagePayload) => {
    return await request.put('/page', data)
}

export const fetchPageGraph = async (): Promise<PageGraphRes> => {
    return await request.get('/page/graph')
}

export const fetchPageAcl = async (pageId: string): Promise<DocAclPolicy> => {
    return await request.get(`/page/${pageId}/acl`)
}

export const updatePageAcl = async (
    pageId: string,
    members: Array<{ userId: number; role: string; operations: string[] }>
): Promise<DocAclPolicy> => {
    return await request.put(`/page/${pageId}/acl`, { members })
}

export const invitePageMember = async (pageId: string, payload: { username: string; role: string; operations: string[] }) => {
    return await request.post(`/page/${pageId}/members/invite`, payload)
}

export const removePageMember = async (pageId: string, userId: number) => {
    return await request.delete(`/page/${pageId}/members/${userId}`)
}

export const fetchPageTags = async (pageId: string): Promise<{ data: TagItem[] }> => {
    return await request.get(`/page/${pageId}/tags`)
}

export const updatePageTags = async (pageId: string, tags: string[]): Promise<{ data: { pageId: string; tags: TagItem[] } }> => {
    return await request.put(`/page/${pageId}/tags`, { tags })
}

export const fetchPageSnapshots = async (pageId: string): Promise<{ data: SnapshotItem[] }> => {
    return await request.get(`/page/${pageId}/snapshots`)
}

export const createPageSnapshot = async (pageId: string, title?: string) => {
    return await request.post(`/page/${pageId}/snapshots`, { title })
}

export const restorePageSnapshot = async (pageId: string, snapshotId: string) => {
    return await request.post(`/page/${pageId}/snapshots/${snapshotId}/restore`)
}
