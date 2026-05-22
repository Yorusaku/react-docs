import { PartialBlock } from '@miaoma-doc/core'

import type { components } from './openapi.generated'
import { Page } from './page'

type ContractSchemas = components['schemas']

export type CreateUserPayload = ContractSchemas['RegisterPayload']

export type LoginPayload = ContractSchemas['LoginPayload']

export type LoginRes = ContractSchemas['LoginResponse']

export type User = ContractSchemas['User'] & { email?: string | null }

export type CurrentUserRes = ContractSchemas['CurrentUserResponse']

export type UserListRes = ContractSchemas['UserListResponse']

export type CreatePagePayload = ContractSchemas['CreatePagePayload']

export type UpdatePagePayload = ContractSchemas['UpdatePagePayload']

export interface PageListRes {
    data: {
        pages: Page[]
        count: number
    }
}

export interface WithLinksPage extends Page {
    links: string[]
}

export interface PageGraphRes {
    data: WithLinksPage[]
}

export type DocRole = ContractSchemas['DocRole']

export type DocOperation = ContractSchemas['DocOperation']

export type DocAclMember = ContractSchemas['DocAclMember']

export interface DocAclPolicy {
    data: DocAclMember[]
}

export type CommentAnchor = ContractSchemas['CommentAnchor']

export type CommentThread = ContractSchemas['CommentThread']

export type NotificationItem = ContractSchemas['NotificationItem']

export type NotificationListRes = ContractSchemas['NotificationListResponse']

export type MarkNotificationReadRes = ContractSchemas['MarkNotificationReadResponse']

export type MarkAllNotificationReadRes = ContractSchemas['MarkAllNotificationsReadResponse']

export interface SnapshotItem {
    snapshotId: string
    title: string
    reason: 'manual' | 'before_restore'
    createdAt: string
    expireAt: string | null
    createdBy: { id: number; username: string } | null
}

export interface TagItem {
    tagId: string
    name: string
    normalizedName?: string
}

export interface TemplateItem {
    templateId: string
    name: string
    emoji: string
    title: string
    description: string | null
    createdAt: string
    updatedAt: string | null
}

export interface SearchPageItem {
    pageId: string
    title: string
    updatedAt: string
}

export interface SearchPageRes {
    data: {
        items: SearchPageItem[]
        nextCursor: string | null
    }
}

export interface AiChatPayload {
    query: string
    conversationId?: string
}

export interface AiChatRes {
    data: {
        blocks: PartialBlock[]
        conversationId: string
    }
}

export interface SsoProvider {
    key: 'wechat-work' | 'dingtalk'
    name: string
}

export interface SsoStartRes {
    data: {
        provider: string
        code: string
        authorizeUrl: string
    }
}

export interface SsoCallbackRes {
    data: {
        access_token: string
        user: User
    }
}

export interface OrgDepartment {
    id: string
    name: string
}

export interface OrgRoleMapping {
    position: string
    defaultRole: DocRole
}

export interface OrgUserMapping {
    userId: number
    username: string
    departmentId: string
    position: string
    defaultRole: DocRole
}

export interface OrgMappingRes {
    data: {
        departments: OrgDepartment[]
        roleMappings: OrgRoleMapping[]
        users: OrgUserMapping[]
    }
}

export type AuditEventItem = ContractSchemas['AuditEventItem']

export type AuditEventsRes = ContractSchemas['AuditEventsResponse']

export type AuditStatsRes = ContractSchemas['AuditStatsResponse']

export type RetentionPolicy = ContractSchemas['RetentionPolicy']

export type ObservabilityDashboardRes = ContractSchemas['ObservabilityDashboardResponse']
