import { AiRewritePayload, AiRewriteRes } from '@/types/api'
import { request } from '@/utils/request'

export const aiRewrite = async (data: AiRewritePayload): Promise<AiRewriteRes> => {
    return await request.post('/ai/rewrite', data)
}
