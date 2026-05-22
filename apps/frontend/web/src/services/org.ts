import { OrgMappingRes } from '@/types/api'
import { request } from '@/utils/request'

export const fetchOrgMappings = async (): Promise<OrgMappingRes> => {
    return await request.get('/org/mappings')
}

export const updateOrgMapping = async (payload: { userId: number; departmentId?: string; position?: string }) => {
    return await request.put('/org/mappings', payload)
}
