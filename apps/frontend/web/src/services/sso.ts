import { SsoCallbackRes, SsoProvider, SsoStartRes } from '@/types/api'
import { request } from '@/utils/request'

export const fetchSsoProviders = async (): Promise<{ data: SsoProvider[] }> => {
    return await request.get('/sso/providers')
}

export const startSsoSimulation = async (provider: SsoProvider['key']): Promise<SsoStartRes> => {
    return await request.post('/sso/simulate/start', { provider })
}

export const completeSsoSimulation = async (provider: SsoProvider['key'], code: string): Promise<SsoCallbackRes> => {
    return await request.post('/sso/simulate/callback', { provider, code })
}
