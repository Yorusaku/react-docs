import { RetentionPolicy } from '@/types/api'
import { request } from '@/utils/request'

export const fetchRetentionPolicy = async (): Promise<{ data: RetentionPolicy }> => {
    return await request.get('/governance/retention')
}

export const updateRetentionPolicy = async (policy: RetentionPolicy): Promise<{ data: RetentionPolicy }> => {
    return await request.put('/governance/retention', policy)
}
