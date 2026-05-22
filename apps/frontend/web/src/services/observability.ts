import { ObservabilityDashboardRes } from '@/types/api'
import { request } from '@/utils/request'

export const fetchObservabilityDashboard = async (): Promise<ObservabilityDashboardRes> => {
    return await request.get('/observability/dashboard')
}
