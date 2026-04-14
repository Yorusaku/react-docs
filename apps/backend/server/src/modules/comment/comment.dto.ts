import { z } from 'zod'

export const createCommentSchema = z
    .object({
        content: z.string().min(1).max(4000),
        anchor: z.record(z.unknown()).nullable().optional(),
        parentCommentId: z.string().optional(),
        mentionUserIds: z.array(z.number().int().positive()).default([]),
    })
    .required()

export type CreateCommentDto = z.infer<typeof createCommentSchema>

export const updateCommentSchema = z
    .object({
        content: z.string().min(1).max(4000).optional(),
        resolved: z.boolean().optional(),
        hidden: z.boolean().optional(),
    })
    .required()

export type UpdateCommentDto = z.infer<typeof updateCommentSchema>
