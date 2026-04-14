import { z } from 'zod'

export const aiChatSchema = z
    .object({
        query: z.string().min(1).max(4000),
        conversationId: z.string().optional().default(''),
    })
    .required()

export type AiChatDto = z.infer<typeof aiChatSchema>
