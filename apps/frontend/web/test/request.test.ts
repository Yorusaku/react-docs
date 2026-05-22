import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock global browser APIs
const locationMock = { href: '' }
vi.stubGlobal('window', { location: locationMock })

const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key]
        }),
        clear: vi.fn(() => {
            store = {}
        }),
    }
})()
vi.stubGlobal('localStorage', localStorageMock)

// Mock import.meta.env
vi.stubEnv('VITE_API_MODE', 'real')

describe('request', () => {
    beforeEach(() => {
        localStorageMock.clear()
        locationMock.href = ''
        // Reset module cache to get fresh axios instance per test
        vi.resetModules()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('request interceptor - token injection', () => {
        it('should add Authorization header when token exists in localStorage', async () => {
            localStorageMock.setItem('token', 'test-jwt-token')

            const { request } = await import('@/utils/request')

            // Trigger request interceptor
            const config = { headers: {} as Record<string, string> }
            const interceptor = (request.interceptors.request as any).handlers[0]
            const result = interceptor.fulfilled(config)

            expect(result.headers.Authorization).toBe('Bearer test-jwt-token')
        })

        it('should not add Authorization header when token is absent', async () => {
            const { request } = await import('@/utils/request')

            const config = { headers: {} as Record<string, string> }
            const interceptor = (request.interceptors.request as any).handlers[0]
            const result = interceptor.fulfilled(config)

            expect(result.headers.Authorization).toBeUndefined()
        })
    })

    describe('response interceptor - data unwrapping', () => {
        it('should unwrap response.data on success', async () => {
            const { request } = await import('@/utils/request')

            const responseInterceptor = (request.interceptors.response as any).handlers[0]
            const result = responseInterceptor.fulfilled({ data: { id: 1, title: 'test' } })

            expect(result).toEqual({ id: 1, title: 'test' })
        })
    })

    describe('response interceptor - 401 handling', () => {
        it('should redirect to /account/login on 401 error', async () => {
            const { request } = await import('@/utils/request')

            const responseInterceptor = (request.interceptors.response as any).handlers[0]
            const error = { response: { status: 401, data: { message: 'Unauthorized' } } }

            try {
                await responseInterceptor.rejected(error)
            } catch {
                // Expected rejection
            }

            expect(locationMock.href).toBe('/account/login')
        })

        it('should reject non-401 errors without redirect', async () => {
            const { request } = await import('@/utils/request')

            const responseInterceptor = (request.interceptors.response as any).handlers[0]
            const error = { response: { status: 500, data: { message: 'Server Error' } } }

            await expect(responseInterceptor.rejected(error)).rejects.toEqual(error)
            expect(locationMock.href).toBe('')
        })

        it('should reject network errors without redirect', async () => {
            const { request } = await import('@/utils/request')

            const responseInterceptor = (request.interceptors.response as any).handlers[0]
            const error = { message: 'Network Error' }

            await expect(responseInterceptor.rejected(error)).rejects.toEqual(error)
            expect(locationMock.href).toBe('')
        })
    })

    describe('baseURL configuration', () => {
        it('should have /api as baseURL', async () => {
            const { request } = await import('@/utils/request')

            expect(request.defaults.baseURL).toBe('/api')
        })
    })
})
