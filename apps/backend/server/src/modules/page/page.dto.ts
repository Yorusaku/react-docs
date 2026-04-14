import { z } from 'zod'

import { DOC_OPERATIONS, DOC_ROLES } from './page-acl.constants'

export const createPageSchema = z
    .object({
        emoji: z.string().min(1).max(8),
        title: z.string().min(1).max(255),
    })
    .required()

export type CreatePageDto = z.infer<typeof createPageSchema>

export const updatePageSchema = z
    .object({
        pageId: z.string().min(1),
        title: z.string().min(1).max(255),
    })
    .required()

export type UpdatePageDto = z.infer<typeof updatePageSchema>

export const deletePageSchema = z
    .object({
        pageId: z.string().min(1),
    })
    .required()

export type DeletePageDto = z.infer<typeof deletePageSchema>

export const inviteMemberSchema = z
    .object({
        username: z.string().min(1).max(255),
        role: z.enum(DOC_ROLES).default('viewer'),
        operations: z.array(z.enum(DOC_OPERATIONS)).default([]),
    })
    .required()

export type InviteMemberDto = z.infer<typeof inviteMemberSchema>

export const updateAclSchema = z
    .object({
        members: z.array(
            z.object({
                userId: z.number().int().positive(),
                role: z.enum(DOC_ROLES),
                operations: z.array(z.enum(DOC_OPERATIONS)).default([]),
            })
        ),
    })
    .required()

export type UpdateAclDto = z.infer<typeof updateAclSchema>

export const updatePageTagsSchema = z
    .object({
        tags: z.array(z.string().min(1).max(80)).max(30),
    })
    .required()

export type UpdatePageTagsDto = z.infer<typeof updatePageTagsSchema>

export const createSnapshotSchema = z
    .object({
        title: z.string().min(1).max(255).optional(),
    })
    .required()

export type CreateSnapshotDto = z.infer<typeof createSnapshotSchema>
