import { z } from 'zod'

export const createTagSchema = z
    .object({
        name: z.string().min(1).max(80),
    })
    .required()

export type CreateTagDto = z.infer<typeof createTagSchema>

export const updateTagSchema = z
    .object({
        name: z.string().min(1).max(80),
    })
    .required()

export type UpdateTagDto = z.infer<typeof updateTagSchema>
