import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGet, mockPost, mockPut, mockPatch, mockDelete } = vi.hoisted(() => ({
    mockGet: vi.fn().mockResolvedValue({}),
    mockPost: vi.fn().mockResolvedValue({}),
    mockPut: vi.fn().mockResolvedValue({}),
    mockPatch: vi.fn().mockResolvedValue({}),
    mockDelete: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/utils/request', () => ({
    request: {
        get: mockGet,
        post: mockPost,
        put: mockPut,
        patch: mockPatch,
        delete: mockDelete,
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
        defaults: { baseURL: '/api' },
    },
}))

import { createComment, fetchComments, removeComment, updateComment } from '@/services/comment'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notification'
import {
    createPage,
    fetchPageDetail,
    fetchPageList,
    fetchTrashPageList,
    permanentDeletePage,
    removePage,
    restorePage,
    updatePage,
} from '@/services/page'
import { searchPages } from '@/services/search'
import { createTag, fetchTags, removeTag } from '@/services/tag'
import { currentUser, listUsers, login, register } from '@/services/user'

describe('services', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('user service', () => {
        it('login should POST to /auth/login with credentials', async () => {
            await login({ username: 'test', password: 'secret' })
            expect(mockPost).toHaveBeenCalledWith('/auth/login', { username: 'test', password: 'secret' })
        })

        it('currentUser should GET /currentUser', async () => {
            await currentUser()
            expect(mockGet).toHaveBeenCalledWith('/currentUser')
        })

        it('register should POST to /user/register', async () => {
            await register({ username: 'new', password: 'pass' })
            expect(mockPost).toHaveBeenCalledWith('/user/register', { username: 'new', password: 'pass' })
        })

        it('listUsers should GET /user/list', async () => {
            await listUsers()
            expect(mockGet).toHaveBeenCalledWith('/user/list')
        })
    })

    describe('page service', () => {
        it('fetchPageList should GET /page', async () => {
            await fetchPageList()
            expect(mockGet).toHaveBeenCalledWith('/page')
        })

        it('createPage should POST to /page with payload', async () => {
            await createPage({ title: 'New Doc' })
            expect(mockPost).toHaveBeenCalledWith('/page', { title: 'New Doc' })
        })

        it('fetchPageDetail should GET /page/:id', async () => {
            await fetchPageDetail('123')
            expect(mockGet).toHaveBeenCalledWith('/page/123')
        })

        it('updatePage should PUT /page with full payload', async () => {
            await updatePage({ pageId: '123', title: 'Updated' })
            expect(mockPut).toHaveBeenCalledWith('/page', { pageId: '123', title: 'Updated' })
        })

        it('removePage should DELETE /page/:id', async () => {
            await removePage('456')
            expect(mockDelete).toHaveBeenCalledWith('/page', { data: { pageId: '456' } })
        })

        it('fetchTrashPageList should GET /page/trash', async () => {
            await fetchTrashPageList()
            expect(mockGet).toHaveBeenCalledWith('/page/trash')
        })

        it('restorePage should POST to /page/:id/restore', async () => {
            await restorePage('789')
            expect(mockPost).toHaveBeenCalledWith('/page/789/restore')
        })

        it('permanentDeletePage should DELETE /page/:id/permanent', async () => {
            await permanentDeletePage('999')
            expect(mockDelete).toHaveBeenCalledWith('/page/999/permanent')
        })
    })

    describe('comment service', () => {
        it('fetchComments should GET /page/:id/comments', async () => {
            await fetchComments('page-1')
            expect(mockGet).toHaveBeenCalledWith('/page/page-1/comments')
        })

        it('createComment should POST with content and mentions', async () => {
            await createComment('page-1', { content: 'Nice!', mentionUserIds: [2] })
            expect(mockPost).toHaveBeenCalledWith('/page/page-1/comments', {
                content: 'Nice!',
                mentionUserIds: [2],
            })
        })

        it('updateComment should PATCH /comments/:id', async () => {
            await updateComment('comment-1', { resolved: true })
            expect(mockPatch).toHaveBeenCalledWith('/comments/comment-1', { resolved: true })
        })

        it('removeComment should DELETE /comments/:id', async () => {
            await removeComment('comment-1')
            expect(mockDelete).toHaveBeenCalledWith('/comments/comment-1')
        })
    })

    describe('notification service', () => {
        it('fetchNotifications should GET /notifications', async () => {
            await fetchNotifications({ status: 'unread' })
            expect(mockGet).toHaveBeenCalledWith('/notifications', { params: { status: 'unread' } })
        })

        it('markNotificationRead should PATCH /notifications/:id/read', async () => {
            await markNotificationRead('notif-1')
            expect(mockPatch).toHaveBeenCalledWith('/notifications/notif-1/read')
        })

        it('markAllNotificationsRead should PATCH /notifications/read-all', async () => {
            await markAllNotificationsRead()
            expect(mockPatch).toHaveBeenCalledWith('/notifications/read-all')
        })
    })

    describe('tag service', () => {
        it('fetchTags should GET /tags', async () => {
            await fetchTags()
            expect(mockGet).toHaveBeenCalledWith('/tags')
        })

        it('createTag should POST to /tags', async () => {
            await createTag('important')
            expect(mockPost).toHaveBeenCalledWith('/tags', { name: 'important' })
        })

        it('removeTag should DELETE /tags/:id', async () => {
            await removeTag('tag-1')
            expect(mockDelete).toHaveBeenCalledWith('/tags/tag-1')
        })
    })

    describe('search service', () => {
        it('searchPages should GET /search/pages with query params', async () => {
            await searchPages({ q: 'hello', tagId: 't1', limit: 10 })
            expect(mockGet).toHaveBeenCalledWith('/search/pages', {
                params: { q: 'hello', tagId: 't1', limit: 10 },
            })
        })
    })
})
