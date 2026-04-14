import { PartialBlock } from '@miaoma-doc/core'

import { Page } from './page'

export interface CreateUserPayload {
    username: string
    password: string
}

export interface LoginPayload {
    username: string
    password: string
}

export interface LoginRes {
    data: {
        access_token: string
    }
}

export interface User {
    id: number
    username: string
    email?: string | null
}

export interface CurrentUserRes {
    data: User
}

export interface UserListRes {
    data: Array<{ id: number; username: string; isCurrent: boolean }>
}

export interface CreatePagePayload {
    emoji: string
    title: string
}

export interface UpdatePagePayload {
    pageId: string
    title: string
}

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

export type DocRole = 'owner' | 'editor' | 'commenter' | 'viewer'

export type DocOperation =
    | 'share'
    | 'member_manage'
    | 'delete'
    | 'restore'
    | 'export'
    | 'comment_moderate'
    | 'template_manage'
    | 'invite_user'

export interface DocAclMember {
    userId: number
    username: string
    role: DocRole
    operations: DocOperation[]
}

export interface DocAclPolicy {
    data: DocAclMember[]
}

export interface CommentAnchor {
    [key: string]: unknown
}

export interface CommentThread {
    commentId: string
    pageId: string
    author: { id: number; username: string } | null
    parentCommentId: string | null
    content: string
    anchor: CommentAnchor | null
    resolved: boolean
    hidden: boolean
    mentionUserIds: number[]
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}

export interface NotificationItem {
    notificationId: string
    type: string
    title: string
    content: string | null
    payload: Record<string, unknown>
    readAt: string | null
    createdAt: string
}

export interface NotificationListRes {
    data: {
        unreadCount: number
        items: NotificationItem[]
    }
}

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
