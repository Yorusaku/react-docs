import { AiChatPayload, AiChatRes } from '@/types/api'
import { request } from '@/utils/request'

export const aiChat = async (data: AiChatPayload): Promise<AiChatRes> => {
    return await request.post('/ai/chat', data)
}
