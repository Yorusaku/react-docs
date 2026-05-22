import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const locationMock = { href: '' }
vi.stubGlobal('window', { location: locationMock })
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value }),
        removeItem: vi.fn((key: string) => { delete store[key] }),
        clear: vi.fn(() => { store = {} }),
    }
})()
vi.stubGlobal('localStorage', localStorageMock)

describe('request (P0)', () => {
    beforeEach(() => { localStorageMock.clear(); locationMock.href = ''; vi.resetModules() })
    afterEach(() => { vi.restoreAllMocks() })

    describe('getApiMode', () => {
        it('返回 mock 当 VITE_API_MODE=mock', async () => {
            vi.stubEnv('VITE_API_MODE', 'mock')
            const { getApiMode } = await import('@/utils/request')
            expect(getApiMode()).toBe('mock')
        })
        it('返回 real 当 VITE_API_MODE=real', async () => {
            vi.stubEnv('VITE_API_MODE', 'real')
            const { getApiMode } = await import('@/utils/request')
            expect(getApiMode()).toBe('real')
        })
        it('默认返回 real', async () => {
            vi.stubEnv('VITE_API_MODE', '')
            const { getApiMode } = await import('@/utils/request')
            expect(getApiMode()).toBe('real')
        })
    })

    describe('real 模式未部署路径拦截', () => {
        // 这些路径在 real 模式下后端尚未实现，请求失败应返回统一消息
        const paths = ['/audit', '/governance', '/observability', '/sso', '/org']
        paths.forEach(prefix => {
            it(`${prefix}/* 404 → notImplemented=true + 统一消息`, async () => {
                vi.stubEnv('VITE_API_MODE', 'real')
                const { request } = await import('@/utils/request')
                const interceptor = (request.interceptors.response as any).handlers[0]
                const err = { response: { status: 404 }, config: { url: `/api${prefix}/events` } }
                await expect(interceptor.rejected(err)).rejects.toMatchObject({
                    response: { data: { success: false, notImplemented: true, message: expect.stringContaining('未启用') } }
                })
            })
        })
        it('普通路径 404 不做拦截', async () => {
            vi.stubEnv('VITE_API_MODE', 'real')
            const { request } = await import('@/utils/request')
            const interceptor = (request.interceptors.response as any).handlers[0]
            const err = { response: { status: 404 }, config: { url: '/api/page' } }
            await expect(interceptor.rejected(err)).rejects.toEqual(err)
        })
        it('mock 模式下不做拦截', async () => {
            vi.stubEnv('VITE_API_MODE', 'mock')
            const { request } = await import('@/utils/request')
            const interceptor = (request.interceptors.response as any).handlers[0]
            const err = { response: { status: 404 }, config: { url: '/api/audit/events' } }
            await expect(interceptor.rejected(err)).rejects.toEqual(err)
        })
    })

    describe('401 重定向', () => {
        it('401 错误 → 跳转 /account/login', async () => {
            vi.stubEnv('VITE_API_MODE', 'real')
            const { request } = await import('@/utils/request')
            const interceptor = (request.interceptors.response as any).handlers[0]
            try { await // eslint-disable-next-line no-empty`n            interceptor.rejected({ response: { status: 401 }, config: {} }) } catch { /* noop */ }
            expect(locationMock.href).toBe('/account/login')
        })
    })

    describe('token 注入', () => {
        it('localStorage 有 token → Authorization header', async () => {
            vi.stubEnv('VITE_API_MODE', 'real')
            localStorageMock.setItem('token', 'jwt-token')
            const { request } = await import('@/utils/request')
            const interceptor = (request.interceptors.request as any).handlers[0]
            expect(interceptor.fulfilled({ headers: {} }).headers.Authorization).toBe('Bearer jwt-token')
        })
    })

    describe('baseURL', () => {
        it('baseURL = /api', async () => {
            vi.stubEnv('VITE_API_MODE', 'real')
            const { request } = await import('@/utils/request')
            expect(request.defaults.baseURL).toBe('/api')
        })
    })
})
