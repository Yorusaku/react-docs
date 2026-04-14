import { z } from 'zod'

export const createTemplateSchema = z
    .object({
        name: z.string().min(1).max(120),
        emoji: z.string().min(1).max(8),
        title: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
    })
    .required()

export type CreateTemplateDto = z.infer<typeof createTemplateSchema>

export const updateTemplateSchema = z
    .object({
        name: z.string().min(1).max(120).optional(),
        emoji: z.string().min(1).max(8).optional(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).nullable().optional(),
    })
    .required()

export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>
