import { CommentThread } from '@/types/api'
import { request } from '@/utils/request'

export const fetchComments = async (pageId: string): Promise<{ data: CommentThread[] }> => {
    return await request.get(`/page/${pageId}/comments`)
}

export const createComment = async (pageId: string, payload: { content: string; parentCommentId?: string; mentionUserIds?: number[] }) => {
    return await request.post(`/page/${pageId}/comments`, payload)
}

export const updateComment = async (commentId: string, payload: { content?: string; resolved?: boolean; hidden?: boolean }) => {
    return await request.patch(`/comments/${commentId}`, payload)
}

export const removeComment = async (commentId: string) => {
    return await request.delete(`/comments/${commentId}`)
}
