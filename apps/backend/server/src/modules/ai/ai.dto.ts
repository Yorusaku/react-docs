import { z } from 'zod'

export const aiRewriteSchema = z.object({
    pageId: z.string().min(1).max(80),
    action: z.enum(['polish', 'shorten']),
    text: z.string().trim().min(1).max(4000),
})

export type AiRewriteDto = z.infer<typeof aiRewriteSchema>
