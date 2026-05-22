import axios, { type CreateAxiosDefaults, type InternalAxiosRequestConfig } from 'axios'

import { handleMockRequest } from '@/mocks/mock-server'

const config: CreateAxiosDefaults = {
    baseURL: '/api',
    timeout: 5000,
}

const apiMode = (import.meta.env.VITE_API_MODE ?? 'real').toLowerCase()

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
        }
        return Promise.reject(error)
    }
)
