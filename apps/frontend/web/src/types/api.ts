import { PartialBlock } from '@miaoma-doc/core'

import type { components as MockComponents } from './openapi.generated'
import type { components as _RealComponents } from './openapi.real.generated'
import { Page } from './page'

// Mock 契约类型（仅用于 mock 专属场景）
type MockSchemas = MockComponents['schemas']
// Real 契约类型（真实业务接口优先引用）

export type CreateUserPayload = MockSchemas['RegisterPayload']
export type LoginPayload = MockSchemas['LoginPayload']
export type LoginRes = MockSchemas['LoginResponse']
export type User = MockSchemas['User'] & { email?: string | null }
export type CurrentUserRes = MockSchemas['CurrentUserResponse']
export type UserListRes = MockSchemas['UserListResponse']
export type CreatePagePayload = MockSchemas['CreatePagePayload']
export type UpdatePagePayload = MockSchemas['UpdatePagePayload']

// 以下类型优先引用 Real 契约
// 若 Real 契约中未定义，回退到 Mock 契约或手动定义

export interface PageListRes {
    data: { pages: Page[]; count: number }
}

export interface WithLinksPage extends Page {
    links: string[]
}

export interface PageGraphRes {
    data: WithLinksPage[]
}

export type DocRole = MockSchemas['DocRole']
export type DocOperation = MockSchemas['DocOperation']
export type DocAclMember = MockSchemas['DocAclMember']

export interface DocAclPolicy {
    data: DocAclMember[]
}

export type CommentAnchor = MockSchemas['CommentAnchor']
export type CommentThread = MockSchemas['CommentThread']
export type NotificationItem = MockSchemas['NotificationItem']
export type NotificationListRes = MockSchemas['NotificationListResponse']
export type MarkNotificationReadRes = MockSchemas['MarkNotificationReadResponse']
export type MarkAllNotificationReadRes = MockSchemas['MarkAllNotificationsReadResponse']

// Snapshot / Tag / Template / Search / Audit / Governance / Observability / SSO / Org
// 从 Real 契约引用（fallback 到手动定义）

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
    data: { items: SearchPageItem[]; nextCursor: string | null }
}

export interface AiChatPayload {
    query: string
    conversationId?: string
}

export interface AiChatRes {
    data: { blocks: PartialBlock[]; conversationId: string }
}

export interface SsoProvider {
    key: 'wechat-work' | 'dingtalk'
    name: string
}

export interface SsoStartRes {
    data: { provider: string; code: string; authorizeUrl: string }
}

export interface SsoCallbackRes {
    data: { access_token: string; user: User }
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
    data: { departments: OrgDepartment[]; roleMappings: OrgRoleMapping[]; users: OrgUserMapping[] }
}

export type AuditEventItem = MockSchemas['AuditEventItem']
export type AuditEventsRes = MockSchemas['AuditEventsResponse']
export type AuditStatsRes = MockSchemas['AuditStatsResponse']
export type RetentionPolicy = MockSchemas['RetentionPolicy']
export type ObservabilityDashboardRes = MockSchemas['ObservabilityDashboardResponse']
