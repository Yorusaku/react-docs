import type { InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it } from 'vitest'

import { handleMockRequest, resetMockDb } from '../../src/mocks/mock-server'

const request = async (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    options?: {
        token?: string
        data?: Record<string, unknown>
        params?: Record<string, string | number | boolean>
    }
) => {
    const config = {
        method,
        url,
        headers: options?.token ? { Authorization: `Bearer ${options.token}` } : {},
        data: options?.data,
        params: options?.params,
    } as InternalAxiosRequestConfig
    return await handleMockRequest(config)
}

describe('mock server', () => {
    beforeEach(() => {
        resetMockDb()
    })

    it('should support auth + page crud basic flow', async () => {
        await request('POST', '/user/register', {
            data: { username: 'tester', password: '123456' },
        })

        const loginRes = await request('POST', '/auth/login', {
            data: { username: 'tester', password: '123456' },
        })
        const token = loginRes.data.access_token as string
        expect(token).toBeTruthy()

        const created = await request('POST', '/page', {
            token,
            data: { emoji: '📘', title: 'Mock Flow Doc' },
        })
        expect(created.data.title).toBe('Mock Flow Doc')

        const pages = await request('GET', '/page', { token })
        expect(pages.data.pages.some((page: { title: string }) => page.title === 'Mock Flow Doc')).toBe(true)
    })

    it('should create backup snapshot before restore', async () => {
        const loginRes = await request('POST', '/auth/login', {
            data: { username: 'demo', password: '123456' },
        })
        const token = loginRes.data.access_token as string

        const pages = await request('GET', '/page', { token })
        const pageId = pages.data.pages[0].pageId as string

        const created = await request('POST', `/page/${pageId}/snapshots`, {
            token,
            data: { title: 'before-test' },
        })

        await request('POST', `/page/${pageId}/snapshots/${created.data.snapshotId}/restore`, { token })

        const snapshots = await request('GET', `/page/${pageId}/snapshots`, { token })
        const hasAutoBackup = snapshots.data.some((row: { reason: string }) => row.reason === 'before_restore')
        expect(hasAutoBackup).toBe(true)
    })

    it('should support comment mention and notification read flow', async () => {
        const demoLogin = await request('POST', '/auth/login', {
            data: { username: 'demo', password: '123456' },
        })
        const managerLogin = await request('POST', '/auth/login', {
            data: { username: 'manager', password: '123456' },
        })
        const demoToken = demoLogin.data.access_token as string
        const managerToken = managerLogin.data.access_token as string

        const pages = await request('GET', '/page', { token: demoToken })
        const pageId = pages.data.pages[0].pageId as string

        const commentRes = await request('POST', `/page/${pageId}/comments`, {
            token: demoToken,
            data: { content: 'ping @manager @ghost', mentions: ['manager', 'ghost'] },
        })
        expect(commentRes.data.mentionUserIds).toContain(2)
        expect(commentRes.data.invalidMentions).toContain('ghost')

        const noticeList = await request('GET', '/notifications', { token: managerToken })
        expect(noticeList.data.unreadCount).toBeGreaterThan(0)
        expect(Array.isArray(noticeList.data.items)).toBe(true)
        const first = noticeList.data.items[0]

        await request('PATCH', `/notifications/${first.notificationId}/read`, {
            token: managerToken,
        })

        const latest = await request('GET', '/notifications', {
            token: managerToken,
            params: { status: 'all', limit: 1 },
        })
        expect(typeof latest.data.nextCursor === 'string' || latest.data.nextCursor === null).toBe(true)
        expect(latest.data.items[0].readAt).not.toBeNull()

        const readAll = await request('PATCH', '/notifications/read-all', {
            token: managerToken,
        })
        expect(readAll.data.success).toBe(true)
        expect(typeof readAll.data.affectedCount).toBe('number')

        const auditStats = await request('GET', '/audit/stats', {
            token: managerToken,
            params: { days: 7 },
        })
        expect(auditStats.data.days).toBe(7)
        expect(Array.isArray(auditStats.data.byType)).toBe(true)
    })
})
