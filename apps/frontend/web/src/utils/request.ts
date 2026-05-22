import axios, { type CreateAxiosDefaults, type InternalAxiosRequestConfig } from 'axios'

import { handleMockRequest } from '@/mocks/mock-server'

const config: CreateAxiosDefaults = {
    baseURL: '/api',
    timeout: 5000,
}

const apiMode = (import.meta.env.VITE_API_MODE ?? 'real').toLowerCase()

export const getApiMode = () => apiMode

// Real 模式下后端尚未实现的路径前缀。对这些路径的失败请求统一返回
// `"后端未启用/能力未部署"`，避免静默走 mock 或产生误导性错误。
const REAL_MODE_NOT_IMPLEMENTED_PREFIXES = [
    '/audit',
    '/governance',
    '/observability',
    '/sso',
    '/org',
]

const isRealModeNotImplementedPath = (url?: string) => {
    if (apiMode !== 'real') return false
    if (!url) return false
    const path = url.replace(/^\/api/, '')
    return REAL_MODE_NOT_IMPLEMENTED_PREFIXES.some(prefix => path.startsWith(prefix))
}

if (apiMode === 'mock') {
    config.adapter = async (requestConfig: InternalAxiosRequestConfig) => {
        try {
            const data = await handleMockRequest(requestConfig)
            return {
                data,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: requestConfig,
                request: {},
            }
        } catch (error) {
            const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status: number }).status) : 500
            const message =
                typeof error === 'object' && error && 'message' in error ? String((error as { message: string }).message) : 'mock error'
            return Promise.reject({
                response: {
                    status,
                    data: {
                        success: false,
                        message,
                    },
                },
                config: requestConfig,
            })
        }
    }
}

export const request = axios.create(config)

request.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

request.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        if (error.response?.status === 401) {
            window.location.href = '/account/login'
            return Promise.reject(error)
        }
        // Real 模式下，若请求的是后端尚未部署的能力路径（audit/governance/observability/sso/org），
        // 统一返回`"后端未启用"`消息，避免静默失败或产生误导。
        if (isRealModeNotImplementedPath(error.config?.url)) {
            return Promise.reject({
                response: {
                    status: error.response?.status ?? 503,
                    data: {
                        success: false,
                        message: '后端未启用/能力未部署（real 模式下此接口尚未实现，仅 mock 模式可用）',
                        notImplemented: true,
                    },
                },
                config: error.config,
            })
        }
        return Promise.reject(error)
    }
)
