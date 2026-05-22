import type { InternalAxiosRequestConfig } from 'axios'

import type { DocOperation, DocRole, NotificationItem, SnapshotItem, TagItem, TemplateItem } from '@/types/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type DocAction = 'read' | 'write' | 'comment' | DocOperation
type QueryValue = string | number | boolean | undefined | null

const API_PREFIX = '/api'
const STORAGE_KEY = 'miaoma-docs-mock-db-v1'
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20

const DOC_OPERATIONS: DocOperation[] = [
    'share',
    'member_manage',
    'delete',
    'restore',
    'export',
    'comment_moderate',
    'template_manage',
    'invite_user',
]

const DOC_ROLE_ACTIONS: Record<DocRole, Set<DocAction>> = {
    owner: new Set<DocAction>(['read', 'write', 'comment', ...DOC_OPERATIONS]),
    editor: new Set<DocAction>(['read', 'write', 'comment']),
    commenter: new Set<DocAction>(['read', 'comment']),
    viewer: new Set<DocAction>(['read']),
}

const AUDIT_EVENT_TYPES = new Set([
    'system',
    'bootstrap',
    'login',
    'register',
    'logout',
    'share',
    'page_create',
    'page_update',
    'page_delete',
    'page_restore',
    'page_permanent_delete',
    'page_export',
    'acl_update',
    'member_invite',
    'member_remove',
    'comment_create',
    'comment_mention_invalid',
    'template_create',
    'template_from_page',
    'snapshot_restore',
    'ai_chat',
    'sso_login',
    'org_mapping_update',
    'retention_update',
    'notification_read',
    'notification_read_all',
    'custom_event',
])

interface MockUser {
    id: number
    username: string
    password: string
    departmentId: string
    position: string
    createdAt: string
}

interface MockPage {
    id: number
    pageId: string
    emoji: string
    title: string
    description: string | null
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    lastSnapshotAt: string | null
}

interface MockPageMember {
    pageId: string
    userId: number
    role: DocRole
    operations: DocOperation[]
    createdAt: string
    updatedAt: string
}

interface MockComment {
    id: number
    commentId: string
    pageId: string
    authorId: number
    parentCommentId: string | null
    content: string
    anchor: Record<string, unknown> | null
    resolved: boolean
    hidden: boolean
    mentionUserIds: number[]
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}

interface MockTemplate {
    id: number
    templateId: string
    name: string
    emoji: string
    title: string
    description: string | null
    documentUpdate: string
    createdById: number
    createdAt: string
    updatedAt: string | null
    deletedAt: string | null
}

interface MockTag {
    id: number
    tagId: string
    name: string
    normalizedName: string
    createdById: number
    createdAt: string
    updatedAt: string
}

interface MockNotification extends NotificationItem {
    id: number
    userId: number
}

interface MockSnapshot extends SnapshotItem {
    id: number
    pageId: string
    documentUpdate: string
}

interface MockSearchJob {
    id: number
    pageId: string
    reason: string
    createdAt: string
    processedAt: string | null
}

interface MockSearchIndex {
    pageId: string
    title: string
    bodyText: string
    tagsText: string
    updatedAt: string
}

interface MockAuditEvent {
    id: number
    eventId: string
    type: string
    actorUserId: number | null
    targetType: string
    targetId: string | null
    summary: string
    meta: Record<string, unknown>
    createdAt: string
}

interface MockRetentionPolicy {
    snapshotDays: number
    trashDays: number
    auditDays: number
}

interface MockMetrics {
    collaborationConnections: number
    rateLimitHits: number
}

interface MockSsoProvider {
    key: 'wechat-work' | 'dingtalk'
    name: string
}

interface MockOrgDepartment {
    id: string
    name: string
}

interface MockOrgRole {
    position: string
    defaultRole: DocRole
}

interface MockDatabase {
    seq: Record<string, number>
    users: MockUser[]
    pages: MockPage[]
    members: MockPageMember[]
    comments: MockComment[]
    notifications: MockNotification[]
    tags: MockTag[]
    pageTags: Record<string, string[]>
    templates: MockTemplate[]
    snapshots: MockSnapshot[]
    searchJobs: MockSearchJob[]
    searchIndex: MockSearchIndex[]
    pageLinks: Record<string, string[]>
    sessions: Record<string, number>
    aiRateWindowByUser: Record<number, { startAt: number; count: number }>
    auditEvents: MockAuditEvent[]
    retentionPolicy: MockRetentionPolicy
    metrics: MockMetrics
    ssoProviders: MockSsoProvider[]
    departments: MockOrgDepartment[]
    orgRoles: MockOrgRole[]
}

class MockHttpError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

const nowISO = () => new Date().toISOString()

const randomId = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 10)}`

const normalizeTagName = (value: string) => value.trim().slice(0, 80)
const normalizeTagKey = (value: string) => normalizeTagName(value).toLowerCase()
const normalizeMentionName = (value: string) => value.trim().replace(/^@+/, '').slice(0, 64)
const extractMentionNamesFromContent = (content: string) => {
    const matches = content.match(/@([A-Za-z0-9_\-\u4e00-\u9fa5]+)/g) ?? []
    return matches.map(item => normalizeMentionName(item)).filter(Boolean)
}
const sanitizeTitle = (title: string) =>
    Array.from(title)
        .filter(char => {
            const code = char.charCodeAt(0)
            return code > 31 && code !== 127
        })
        .join('')
        .trim()
        .slice(0, 255)

const canUseLocalStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const createDefaultDb = (): MockDatabase => {
    const createdAt = nowISO()
    const pageId = 'page' + randomId('')
    const snapshotId = 'snapshot' + randomId('')
    const tagId = 'tag' + randomId('')
    const templateId = 'tpl' + randomId('')
    const noticeId = 'notice' + randomId('')
    const eventId = 'audit' + randomId('')

    return {
        seq: {
            user: 2,
            page: 2,
            comment: 1,
            notification: 2,
            tag: 2,
            template: 2,
            snapshot: 2,
            searchJob: 2,
            audit: 2,
        },
        users: [
            {
                id: 1,
                username: 'demo',
                password: '123456',
                departmentId: 'dept-rd',
                position: 'frontend',
                createdAt,
            },
            {
                id: 2,
                username: 'manager',
                password: '123456',
                departmentId: 'dept-rd',
                position: 'manager',
                createdAt,
            },
        ],
        pages: [
            {
                id: 1,
                pageId,
                emoji: '馃搫',
                title: '绀轰緥鍗忎綔鏂囨。',
                description: '鐢ㄤ簬婕旂ず绠€鍘嗛」鐩殑 mock 涓氬姟闂幆',
                createdAt,
                updatedAt: createdAt,
                deletedAt: null,
                lastSnapshotAt: createdAt,
            },
        ],
        members: [
            {
                pageId,
                userId: 1,
                role: 'owner',
                operations: [],
                createdAt,
                updatedAt: createdAt,
            },
            {
                pageId,
                userId: 2,
                role: 'editor',
                operations: ['invite_user'],
                createdAt,
                updatedAt: createdAt,
            },
        ],
        comments: [],
        notifications: [
            {
                id: 1,
                notificationId: noticeId,
                userId: 1,
                type: 'system',
                title: '娆㈣繋浣跨敤 Mock 妯″紡',
                content: '当前前端已切换到业务型 Mock，可随时切换到真实后端。',
                payload: { source: 'mock-bootstrap' },
                readAt: null,
                createdAt,
            },
        ],
        tags: [
            {
                id: 1,
                tagId,
                name: '鍗忎綔',
                normalizedName: '鍗忎綔',
                createdById: 1,
                createdAt,
                updatedAt: createdAt,
            },
        ],
        pageTags: {
            [pageId]: [tagId],
        },
        templates: [
            {
                id: 1,
                templateId,
                name: '椤圭洰澶嶇洏妯℃澘',
                emoji: '馃З',
                title: '椤圭洰澶嶇洏',
                description: '鐩爣 / 缁撴灉 / 闂 / 鍚庣画鍔ㄤ綔',
                documentUpdate: 'mock-template-update',
                createdById: 1,
                createdAt,
                updatedAt: null,
                deletedAt: null,
            },
        ],
        snapshots: [
            {
                id: 1,
                snapshotId,
                pageId,
                title: '鍒濆蹇収',
                reason: 'manual',
                createdAt,
                expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: { id: 1, username: 'demo' },
                documentUpdate: 'mock-page-update',
            },
        ],
        searchJobs: [
            {
                id: 1,
                pageId,
                reason: 'bootstrap',
                createdAt,
                processedAt: null,
            },
        ],
        searchIndex: [],
        pageLinks: {
            [pageId]: [],
        },
        sessions: {},
        aiRateWindowByUser: {},
        auditEvents: [
            {
                id: 1,
                eventId,
                type: 'bootstrap',
                actorUserId: 1,
                targetType: 'system',
                targetId: null,
                summary: '鍒濆鍖?mock 鏁版嵁',
                meta: { mode: 'mock' },
                createdAt,
            },
        ],
        retentionPolicy: {
            snapshotDays: 30,
            trashDays: 30,
            auditDays: 90,
        },
        metrics: {
            collaborationConnections: 0,
            rateLimitHits: 0,
        },
        ssoProviders: [
            { key: 'wechat-work', name: '浼佷笟寰俊' },
            { key: 'dingtalk', name: '閽夐拤' },
        ],
        departments: [
            { id: 'dept-rd', name: '鐮斿彂涓績' },
            { id: 'dept-pm', name: '浜у搧涓績' },
            { id: 'dept-op', name: '杩愯惀涓績' },
        ],
        orgRoles: [
            { position: 'frontend', defaultRole: 'editor' },
            { position: 'backend', defaultRole: 'editor' },
            { position: 'manager', defaultRole: 'owner' },
            { position: 'intern', defaultRole: 'viewer' },
        ],
    }
}

const reviveDb = (raw: MockDatabase): MockDatabase => {
    return {
        ...raw,
        pageTags: raw.pageTags ?? {},
        pageLinks: raw.pageLinks ?? {},
        sessions: raw.sessions ?? {},
        aiRateWindowByUser: raw.aiRateWindowByUser ?? {},
        searchJobs: raw.searchJobs ?? [],
        searchIndex: raw.searchIndex ?? [],
        auditEvents: raw.auditEvents ?? [],
        retentionPolicy: raw.retentionPolicy ?? {
            snapshotDays: 30,
            trashDays: 30,
            auditDays: 90,
        },
        metrics: raw.metrics ?? {
            collaborationConnections: 0,
            rateLimitHits: 0,
        },
        ssoProviders: raw.ssoProviders ?? [
            { key: 'wechat-work', name: '浼佷笟寰俊' },
            { key: 'dingtalk', name: '閽夐拤' },
        ],
        departments: raw.departments ?? [
            { id: 'dept-rd', name: '鐮斿彂涓績' },
            { id: 'dept-pm', name: '浜у搧涓績' },
        ],
        orgRoles: raw.orgRoles ?? [
            { position: 'frontend', defaultRole: 'editor' },
            { position: 'backend', defaultRole: 'editor' },
            { position: 'manager', defaultRole: 'owner' },
        ],
    }
}

const loadDb = (): MockDatabase => {
    if (!canUseLocalStorage()) {
        return createDefaultDb()
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            const seed = createDefaultDb()
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
            return seed
        }
        return reviveDb(JSON.parse(raw) as MockDatabase)
    } catch {
        return createDefaultDb()
    }
}

let db: MockDatabase = loadDb()

const persistDb = () => {
    if (!canUseLocalStorage()) {
        return
    }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch {
        // ignore storage write errors
    }
}

export const resetMockDb = () => {
    db = createDefaultDb()
    persistDb()
}

const nextSeq = (key: keyof MockDatabase['seq']) => {
    db.seq[key] += 1
    return db.seq[key] - 1
}

const toOps = (ops: unknown): DocOperation[] => {
    if (!Array.isArray(ops)) {
        return []
    }
    const result = new Set<DocOperation>()
    for (const value of ops) {
        if (typeof value !== 'string') {
            continue
        }
        if (DOC_OPERATIONS.includes(value as DocOperation)) {
            result.add(value as DocOperation)
        }
    }
    return Array.from(result)
}

const toRole = (role: unknown): DocRole => {
    if (role === 'owner' || role === 'editor' || role === 'commenter' || role === 'viewer') {
        return role
    }
    return 'viewer'
}

const hasAction = (role: DocRole, operations: DocOperation[], action: DocAction) => {
    if (role === 'owner') {
        return true
    }
    if (DOC_ROLE_ACTIONS[role].has(action)) {
        return true
    }
    return operations.includes(action as DocOperation)
}

const parseJsonBody = (config: InternalAxiosRequestConfig): Record<string, unknown> => {
    const body = config.data
    if (!body) {
        return {}
    }
    if (typeof body === 'string') {
        try {
            return JSON.parse(body) as Record<string, unknown>
        } catch {
            return {}
        }
    }
    if (typeof body === 'object') {
        return body as Record<string, unknown>
    }
    return {}
}

const parseQuery = (config: InternalAxiosRequestConfig): URLSearchParams => {
    const params = new URLSearchParams()
    const url = config.url ?? ''
    const queryStart = url.indexOf('?')
    if (queryStart >= 0) {
        const urlParams = new URLSearchParams(url.slice(queryStart + 1))
        for (const [key, value] of urlParams.entries()) {
            params.append(key, value)
        }
    }
    const configParams = config.params as Record<string, QueryValue> | undefined
    if (configParams) {
        for (const [key, value] of Object.entries(configParams)) {
            if (value === undefined || value === null) {
                continue
            }
            params.set(key, String(value))
        }
    }
    return params
}

const normalizePath = (url: string | undefined) => {
    if (!url) {
        return '/'
    }
    const pure = url.split('?')[0]
    const withLeadingSlash = pure.startsWith('/') ? pure : `/${pure}`
    return withLeadingSlash.startsWith(API_PREFIX) ? withLeadingSlash.slice(API_PREFIX.length) || '/' : withLeadingSlash
}

const matchPath = (path: string, pattern: string): Record<string, string> | null => {
    const pathParts = path.split('/').filter(Boolean)
    const patternParts = pattern.split('/').filter(Boolean)
    if (pathParts.length !== patternParts.length) {
        return null
    }
    const params: Record<string, string> = {}
    for (let i = 0; i < patternParts.length; i += 1) {
        const current = patternParts[i]
        const actual = pathParts[i]
        if (current.startsWith(':')) {
            params[current.slice(1)] = actual
            continue
        }
        if (current !== actual) {
            return null
        }
    }
    return params
}

const resolveToken = (config: InternalAxiosRequestConfig) => {
    const headers = config.headers
    const authRaw =
        typeof headers?.get === 'function'
            ? headers.get('Authorization')
            : ((headers?.Authorization as string | undefined) ??
              (headers?.authorization as string | undefined) ??
              (headers?.AUTHORIZATION as string | undefined))
    if (!authRaw || !authRaw.startsWith('Bearer ')) {
        return null
    }
    return authRaw.slice('Bearer '.length)
}

const findUserByToken = (config: InternalAxiosRequestConfig): MockUser | null => {
    const token = resolveToken(config)
    if (!token) {
        return null
    }
    const userId = db.sessions[token]
    if (!userId) {
        return null
    }
    return db.users.find(user => user.id === userId) ?? null
}

const ensureAuth = (config: InternalAxiosRequestConfig): MockUser => {
    const user = findUserByToken(config)
    if (!user) {
        throw new MockHttpError(401, 'Unauthorized')
    }
    return user
}

const findPage = (pageId: string, includeDeleted = false): MockPage => {
    const page = db.pages.find(item => item.pageId === pageId)
    if (!page || (!includeDeleted && page.deletedAt)) {
        throw new MockHttpError(404, 'page not found')
    }
    return page
}

const findMember = (pageId: string, userId: number): MockPageMember | null => {
    return db.members.find(item => item.pageId === pageId && item.userId === userId) ?? null
}

const assertAction = (pageId: string, userId: number, action: DocAction, includeDeleted = false) => {
    const page = findPage(pageId, includeDeleted)
    const member = findMember(pageId, userId)
    if (!member) {
        throw new MockHttpError(403, 'member required')
    }
    if (!hasAction(member.role, member.operations, action)) {
        throw new MockHttpError(403, 'permission denied')
    }
    return { page, member }
}

const addAuditEvent = (payload: {
    type: string
    actorUserId: number | null
    targetType: string
    targetId: string | null
    summary: string
    meta?: Record<string, unknown>
}) => {
    const normalizedType = AUDIT_EVENT_TYPES.has(payload.type) ? payload.type : 'custom_event'
    const event: MockAuditEvent = {
        id: nextSeq('audit'),
        eventId: 'audit' + randomId(''),
        type: normalizedType,
        actorUserId: payload.actorUserId,
        targetType: payload.targetType,
        targetId: payload.targetId,
        summary: payload.summary,
        meta: payload.meta ?? {},
        createdAt: nowISO(),
    }
    db.auditEvents.unshift(event)
}

const getUserView = (user: MockUser) => {
    return {
        id: user.id,
        username: user.username,
    }
}

const issueToken = (userId: number) => {
    const token = 'mock.' + randomId('token_')
    db.sessions[token] = userId
    return token
}

const enqueueSearch = (pageId: string, reason: string) => {
    const job: MockSearchJob = {
        id: nextSeq('searchJob'),
        pageId,
        reason,
        createdAt: nowISO(),
        processedAt: null,
    }
    db.searchJobs.push(job)
}

const upsertSearchIndex = (page: MockPage) => {
    const tagIds = db.pageTags[page.pageId] ?? []
    const tagNames = tagIds
        .map(tagId => db.tags.find(tag => tag.tagId === tagId)?.name ?? '')
        .filter(Boolean)
        .join(' ')

    const existing = db.searchIndex.find(item => item.pageId === page.pageId)
    if (existing) {
        existing.title = page.title
        existing.tagsText = tagNames
        existing.bodyText = ''
        existing.updatedAt = nowISO()
        return
    }

    db.searchIndex.push({
        pageId: page.pageId,
        title: page.title,
        tagsText: tagNames,
        bodyText: '',
        updatedAt: nowISO(),
    })
}

const processSearchJobs = (limit = 50) => {
    const pending = db.searchJobs.filter(item => !item.processedAt).slice(0, limit)
    for (const job of pending) {
        const page = db.pages.find(item => item.pageId === job.pageId)
        if (!page || page.deletedAt) {
            db.searchIndex = db.searchIndex.filter(item => item.pageId !== job.pageId)
            job.processedAt = nowISO()
            continue
        }
        upsertSearchIndex(page)
        job.processedAt = nowISO()
    }
}

const cleanupRetention = () => {
    const now = Date.now()
    const snapshotThreshold = now - db.retentionPolicy.snapshotDays * 24 * 60 * 60 * 1000
    const trashThreshold = now - db.retentionPolicy.trashDays * 24 * 60 * 60 * 1000
    const auditThreshold = now - db.retentionPolicy.auditDays * 24 * 60 * 60 * 1000

    db.snapshots = db.snapshots.filter(item => {
        if (!item.expireAt) {
            return true
        }
        return new Date(item.expireAt).getTime() >= snapshotThreshold
    })

    const toDeletePageIds = new Set(
        db.pages.filter(page => page.deletedAt && new Date(page.deletedAt).getTime() < trashThreshold).map(page => page.pageId)
    )
    if (toDeletePageIds.size > 0) {
        db.pages = db.pages.filter(page => !toDeletePageIds.has(page.pageId))
        db.members = db.members.filter(member => !toDeletePageIds.has(member.pageId))
        db.comments = db.comments.filter(comment => !toDeletePageIds.has(comment.pageId))
        db.snapshots = db.snapshots.filter(snapshot => !toDeletePageIds.has(snapshot.pageId))
        db.searchJobs = db.searchJobs.filter(job => !toDeletePageIds.has(job.pageId))
        db.searchIndex = db.searchIndex.filter(item => !toDeletePageIds.has(item.pageId))
        for (const pageId of toDeletePageIds) {
            delete db.pageTags[pageId]
            delete db.pageLinks[pageId]
        }
    }

    db.auditEvents = db.auditEvents.filter(item => new Date(item.createdAt).getTime() >= auditThreshold)
}

const listAccessiblePages = (userId: number, includeDeleted = false) => {
    const memberPageIds = new Set(db.members.filter(item => item.userId === userId).map(item => item.pageId))
    return db.pages
        .filter(page => memberPageIds.has(page.pageId))
        .filter(page => (includeDeleted ? true : !page.deletedAt))
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

const buildAclRows = (pageId: string) => {
    return db.members
        .filter(item => item.pageId === pageId)
        .sort((a, b) => a.userId - b.userId)
        .map(member => {
            const user = db.users.find(item => item.id === member.userId)
            return {
                userId: member.userId,
                username: user?.username ?? `user-${member.userId}`,
                role: member.role,
                operations: member.operations,
            }
        })
}

const ensureTemplateManageGlobal = (userId: number) => {
    const ok = db.members.some(member => member.userId === userId && hasAction(member.role, member.operations, 'template_manage'))
    if (!ok) {
        throw new MockHttpError(403, 'permission denied')
    }
}

const addMentionNotifications = (payload: {
    pageId: string
    fromUserId: number
    commentId: string
    mentionUserIds: number[]
    content: string
}) => {
    const targets = Array.from(new Set(payload.mentionUserIds)).filter(id => id !== payload.fromUserId)
    const createdAt = nowISO()
    for (const userId of targets) {
        const row: MockNotification = {
            id: nextSeq('notification'),
            notificationId: 'notice' + randomId(''),
            userId,
            type: 'comment_mention',
            title: '你被提及了',
            content: payload.content.slice(0, 300),
            payload: {
                pageId: payload.pageId,
                commentId: payload.commentId,
                fromUserId: payload.fromUserId,
            },
            readAt: null,
            createdAt,
        }
        db.notifications.unshift(row)
    }
}

const buildPageListItem = (page: MockPage) => {
    return {
        pageId: page.pageId,
        emoji: page.emoji,
        title: page.title,
        description: page.description,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        deletedAt: page.deletedAt,
        lastSnapshotAt: page.lastSnapshotAt,
    }
}

const assertRateLimit = (userId: number) => {
    const now = Date.now()
    const prev = db.aiRateWindowByUser[userId]
    if (!prev || now - prev.startAt > RATE_LIMIT_WINDOW_MS) {
        db.aiRateWindowByUser[userId] = {
            startAt: now,
            count: 1,
        }
        return
    }
    if (prev.count >= RATE_LIMIT_MAX) {
        db.metrics.rateLimitHits += 1
        throw new MockHttpError(429, 'AI request too frequent, please retry later')
    }
    prev.count += 1
}

const createSnapshot = (page: MockPage, createdBy: MockUser | null, title: string, reason: 'manual' | 'before_restore') => {
    const createdAt = nowISO()
    const snapshot: MockSnapshot = {
        id: nextSeq('snapshot'),
        snapshotId: 'snapshot' + randomId(''),
        pageId: page.pageId,
        title: sanitizeTitle(title) || page.title,
        reason,
        createdAt,
        expireAt: new Date(Date.now() + db.retentionPolicy.snapshotDays * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: createdBy ? { id: createdBy.id, username: createdBy.username } : null,
        documentUpdate: 'mock-document-update',
    }
    db.snapshots.unshift(snapshot)
    page.lastSnapshotAt = createdAt
    page.updatedAt = createdAt
    return snapshot
}

const createPage = (payload: { emoji: string; title: string; description?: string | null }, ownerUserId: number) => {
    const createdAt = nowISO()
    const page: MockPage = {
        id: nextSeq('page'),
        pageId: 'page' + randomId(''),
        emoji: payload.emoji || '馃搫',
        title: sanitizeTitle(payload.title) || 'Untitled Document',
        description: payload.description?.trim() ?? null,
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
        lastSnapshotAt: null,
    }
    db.pages.unshift(page)
    db.members.push({
        pageId: page.pageId,
        userId: ownerUserId,
        role: 'owner',
        operations: [],
        createdAt,
        updatedAt: createdAt,
    })
    db.pageLinks[page.pageId] = []
    db.pageTags[page.pageId] = []
    enqueueSearch(page.pageId, 'page_created')
    return page
}

const coerceLimit = (raw: string | null, fallback: number, min: number, max: number) => {
    const parsed = raw ? Number(raw) : fallback
    if (!Number.isFinite(parsed)) {
        return fallback
    }
    return Math.max(min, Math.min(max, Math.floor(parsed)))
}

const handleAuthRoutes = (method: HttpMethod, path: string, body: Record<string, unknown>) => {
    if (method === 'POST' && path === '/auth/login') {
        const username = String(body.username ?? '').trim()
        const password = String(body.password ?? '')
        const user = db.users.find(item => item.username === username && item.password === password)
        if (!user) {
            throw new MockHttpError(401, 'Invalid username or password')
        }
        const accessToken = issueToken(user.id)
        addAuditEvent({
            type: 'login',
            actorUserId: user.id,
            targetType: 'user',
            targetId: String(user.id),
            summary: `${user.username} 鐧诲綍`,
        })
        return {
            data: {
                access_token: accessToken,
            },
            success: true,
        }
    }

    if (method === 'POST' && path === '/user/register') {
        const username = String(body.username ?? '').trim()
        const password = String(body.password ?? '')
        if (!username || !password) {
            throw new MockHttpError(400, 'username and password are required')
        }
        const duplicated = db.users.some(item => item.username === username)
        if (duplicated) {
            throw new MockHttpError(400, 'user is existed')
        }
        const createdAt = nowISO()
        const userId = nextSeq('user')
        const user: MockUser = {
            id: userId,
            username,
            password,
            departmentId: 'dept-rd',
            position: 'frontend',
            createdAt,
        }
        db.users.push(user)
        addAuditEvent({
            type: 'register',
            actorUserId: user.id,
            targetType: 'user',
            targetId: String(user.id),
            summary: `${username} 娉ㄥ唽`,
        })
        return {
            data: getUserView(user),
            success: true,
        }
    }

    return null
}

const handleProtectedRoutes = (method: HttpMethod, path: string, query: URLSearchParams, body: Record<string, unknown>, user: MockUser) => {
    if (method === 'POST' && path === '/auth/logout') {
        const token = resolveToken({
            ...({} as InternalAxiosRequestConfig),
            headers: { Authorization: `Bearer ${Object.keys(db.sessions).find(k => db.sessions[k] === user.id) ?? ''}` },
        })
        if (token) {
            delete db.sessions[token]
        }
        addAuditEvent({
            type: 'logout',
            actorUserId: user.id,
            targetType: 'user',
            targetId: String(user.id),
            summary: `${user.username} logout`,
        })
        return { success: true }
    }

    if (method === 'GET' && path === '/currentUser') {
        return {
            data: getUserView(user),
            success: true,
        }
    }

    if (method === 'GET' && path === '/me') {
        return getUserView(user)
    }

    if (method === 'GET' && path === '/user/list') {
        const list = db.users
            .slice()
            .sort((a, b) => a.id - b.id)
            .map(item => ({
                id: item.id,
                username: item.username,
                isCurrent: item.id === user.id,
            }))
        return {
            data: list,
            success: true,
        }
    }

    if (method === 'GET' && path === '/page') {
        const pages = listAccessiblePages(user.id, false).map(buildPageListItem)
        return {
            data: {
                pages,
                count: pages.length,
            },
            success: true,
        }
    }

    if (method === 'GET' && path === '/page/trash') {
        const pages = listAccessiblePages(user.id, true)
            .filter(item => !!item.deletedAt)
            .sort((a, b) => +new Date(b.deletedAt ?? 0) - +new Date(a.deletedAt ?? 0))
            .map(buildPageListItem)
        return {
            data: {
                pages,
                count: pages.length,
            },
            success: true,
        }
    }

    if (method === 'POST' && path === '/page') {
        const page = createPage(
            {
                emoji: String(body.emoji ?? '馃搫'),
                title: String(body.title ?? 'Untitled Document'),
                description: typeof body.description === 'string' ? body.description : null,
            },
            user.id
        )
        addAuditEvent({
            type: 'page_create',
            actorUserId: user.id,
            targetType: 'page',
            targetId: page.pageId,
            summary: `鍒涘缓椤甸潰 ${page.title}`,
        })
        return { data: buildPageListItem(page), success: true }
    }

    if (method === 'PUT' && path === '/page') {
        const pageId = String(body.pageId ?? '')
        const title = sanitizeTitle(String(body.title ?? ''))
        const { page } = assertAction(pageId, user.id, 'write')
        page.title = title || page.title
        page.updatedAt = nowISO()
        enqueueSearch(page.pageId, 'title_updated')
        addAuditEvent({
            type: 'page_update',
            actorUserId: user.id,
            targetType: 'page',
            targetId: page.pageId,
            summary: `鏇存柊椤甸潰鏍囬涓?${page.title}`,
        })
        return { data: buildPageListItem(page), success: true }
    }

    if (method === 'DELETE' && path === '/page') {
        const pageId = String(body.pageId ?? '')
        const { page } = assertAction(pageId, user.id, 'delete')
        page.deletedAt = nowISO()
        page.updatedAt = nowISO()
        enqueueSearch(page.pageId, 'page_deleted')
        addAuditEvent({
            type: 'page_delete',
            actorUserId: user.id,
            targetType: 'page',
            targetId: page.pageId,
            summary: `杞垹闄ら〉闈?${page.title}`,
        })
        return { data: { pageId }, success: true }
    }

    if (method === 'GET' && path === '/page/graph') {
        const pages = listAccessiblePages(user.id, false)
        const graph = pages.map(page => ({
            ...buildPageListItem(page),
            links: db.pageLinks[page.pageId] ?? [],
        }))
        return { data: graph, success: true }
    }

    const pageDetailParams = matchPath(path, '/page/:pageId')
    if (pageDetailParams && method === 'GET') {
        const { page } = assertAction(pageDetailParams.pageId, user.id, 'read')
        db.metrics.collaborationConnections = Math.max(1, db.metrics.collaborationConnections)
        return { data: buildPageListItem(page), success: true }
    }

    const restoreParams = matchPath(path, '/page/:pageId/restore')
    if (restoreParams && method === 'POST') {
        const { page } = assertAction(restoreParams.pageId, user.id, 'restore', true)
        page.deletedAt = null
        page.updatedAt = nowISO()
        enqueueSearch(page.pageId, 'page_restored')
        addAuditEvent({
            type: 'page_restore',
            actorUserId: user.id,
            targetType: 'page',
            targetId: page.pageId,
            summary: `鎭㈠椤甸潰 ${page.title}`,
        })
        return { data: { pageId: page.pageId }, success: true }
    }

    const permanentParams = matchPath(path, '/page/:pageId/permanent')
    if (permanentParams && method === 'DELETE') {
        const { page } = assertAction(permanentParams.pageId, user.id, 'delete', true)
        db.pages = db.pages.filter(item => item.pageId !== page.pageId)
        db.members = db.members.filter(item => item.pageId !== page.pageId)
        db.comments = db.comments.filter(item => item.pageId !== page.pageId)
        db.snapshots = db.snapshots.filter(item => item.pageId !== page.pageId)
        db.searchJobs = db.searchJobs.filter(item => item.pageId !== page.pageId)
        db.searchIndex = db.searchIndex.filter(item => item.pageId !== page.pageId)
        delete db.pageTags[page.pageId]
        delete db.pageLinks[page.pageId]
        addAuditEvent({
            type: 'page_permanent_delete',
            actorUserId: user.id,
            targetType: 'page',
            targetId: page.pageId,
            summary: `姘镐箙鍒犻櫎椤甸潰 ${page.title}`,
        })
        return { data: { pageId: page.pageId }, success: true }
    }

    const aclParams = matchPath(path, '/page/:pageId/acl')
    if (aclParams && method === 'GET') {
        assertAction(aclParams.pageId, user.id, 'member_manage')
        return { data: buildAclRows(aclParams.pageId), success: true }
    }
    if (aclParams && method === 'PUT') {
        assertAction(aclParams.pageId, user.id, 'member_manage')
        const nextMembers = Array.isArray(body.members) ? body.members : []
        const normalized = nextMembers.map(item => {
            const current = item as Record<string, unknown>
            return {
                pageId: aclParams.pageId,
                userId: Number(current.userId ?? 0),
                role: toRole(current.role),
                operations: toOps(current.operations),
                createdAt: nowISO(),
                updatedAt: nowISO(),
            }
        })
        const ownerCount = normalized.filter(item => item.role === 'owner').length
        if (ownerCount === 0) {
            throw new MockHttpError(400, 'at least one owner is required')
        }
        db.members = db.members.filter(item => item.pageId !== aclParams.pageId).concat(normalized)
        addAuditEvent({
            type: 'acl_update',
            actorUserId: user.id,
            targetType: 'page',
            targetId: aclParams.pageId,
            summary: '鏇存柊椤甸潰鏉冮檺绛栫暐',
            meta: { members: normalized.length },
        })
        return { data: buildAclRows(aclParams.pageId), success: true }
    }

    const inviteParams = matchPath(path, '/page/:pageId/members/invite')
    if (inviteParams && method === 'POST') {
        assertAction(inviteParams.pageId, user.id, 'invite_user')
        const username = String(body.username ?? '').trim()
        const role = toRole(body.role)
        const operations = toOps(body.operations)
        const targetUser = db.users.find(item => item.username === username)
        if (!targetUser) {
            throw new MockHttpError(404, 'user not found')
        }
        const member = findMember(inviteParams.pageId, targetUser.id)
        if (member) {
            member.role = role
            member.operations = operations
            member.updatedAt = nowISO()
        } else {
            db.members.push({
                pageId: inviteParams.pageId,
                userId: targetUser.id,
                role,
                operations,
                createdAt: nowISO(),
                updatedAt: nowISO(),
            })
        }
        addAuditEvent({
            type: 'member_invite',
            actorUserId: user.id,
            targetType: 'page',
            targetId: inviteParams.pageId,
            summary: `閭€璇锋垚鍛?${username}`,
        })
        return {
            data: {
                userId: targetUser.id,
                role,
                operations,
            },
            success: true,
        }
    }

    const removeMemberParams = matchPath(path, '/page/:pageId/members/:userId')
    if (removeMemberParams && method === 'DELETE') {
        assertAction(removeMemberParams.pageId, user.id, 'member_manage')
        const targetUserId = Number(removeMemberParams.userId)
        const target = findMember(removeMemberParams.pageId, targetUserId)
        if (!target) {
            throw new MockHttpError(404, 'member not found')
        }
        if (target.role === 'owner') {
            const ownerCount = db.members.filter(item => item.pageId === removeMemberParams.pageId && item.role === 'owner').length
            if (ownerCount <= 1) {
                throw new MockHttpError(403, 'at least one owner is required')
            }
        }
        db.members = db.members.filter(item => !(item.pageId === removeMemberParams.pageId && item.userId === targetUserId))
        addAuditEvent({
            type: 'member_remove',
            actorUserId: user.id,
            targetType: 'page',
            targetId: removeMemberParams.pageId,
            summary: `绉婚櫎鎴愬憳 ${targetUserId}`,
        })
        return { data: { userId: targetUserId }, success: true }
    }

    const commentsListParams = matchPath(path, '/page/:pageId/comments')
    if (commentsListParams && method === 'GET') {
        assertAction(commentsListParams.pageId, user.id, 'read')
        const items = db.comments
            .filter(item => item.pageId === commentsListParams.pageId)
            .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
            .map(item => ({
                commentId: item.commentId,
                pageId: item.pageId,
                author: getUserView(db.users.find(userRow => userRow.id === item.authorId) ?? user),
                parentCommentId: item.parentCommentId,
                content: item.content,
                anchor: item.anchor,
                resolved: item.resolved,
                hidden: item.hidden,
                mentionUserIds: item.mentionUserIds,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                deletedAt: item.deletedAt,
            }))
        return { data: items, success: true }
    }
    if (commentsListParams && method === 'POST') {
        assertAction(commentsListParams.pageId, user.id, 'comment')
        const content = String(body.content ?? '').trim()
        if (!content) {
            throw new MockHttpError(400, 'content is required')
        }
        const parentCommentId = typeof body.parentCommentId === 'string' ? body.parentCommentId : null
        if (parentCommentId) {
            const exists = db.comments.some(item => item.commentId === parentCommentId && item.pageId === commentsListParams.pageId)
            if (!exists) {
                throw new MockHttpError(404, 'parent comment not found')
            }
        }
        const mentionUserIdsById = Array.isArray(body.mentionUserIds)
            ? body.mentionUserIds.map(item => Number(item)).filter(item => Number.isInteger(item) && item > 0)
            : []
        const mentionNamesFromPayload = Array.isArray(body.mentions)
            ? body.mentions.map(item => normalizeMentionName(String(item))).filter(Boolean)
            : []
        const mentionNamesFromContent = extractMentionNamesFromContent(content)
        const mentionNames = Array.from(new Set([...mentionNamesFromPayload, ...mentionNamesFromContent]))
        const mentionUserIdsByName: number[] = []
        const invalidMentions: string[] = []
        for (const username of mentionNames) {
            const targetUser = db.users.find(item => item.username === username)
            if (targetUser) {
                mentionUserIdsByName.push(targetUser.id)
            } else {
                invalidMentions.push(username)
            }
        }
        const mentionUserIds = Array.from(new Set([...mentionUserIdsById, ...mentionUserIdsByName]))
        const createdAt = nowISO()
        const comment: MockComment = {
            id: nextSeq('comment'),
            commentId: 'comment' + randomId(''),
            pageId: commentsListParams.pageId,
            authorId: user.id,
            parentCommentId,
            content,
            anchor: typeof body.anchor === 'object' && body.anchor !== null ? (body.anchor as Record<string, unknown>) : null,
            resolved: false,
            hidden: false,
            mentionUserIds,
            createdAt,
            updatedAt: createdAt,
            deletedAt: null,
        }
        db.comments.push(comment)
        addMentionNotifications({
            pageId: commentsListParams.pageId,
            fromUserId: user.id,
            commentId: comment.commentId,
            mentionUserIds,
            content,
        })
        if (invalidMentions.length > 0) {
            addAuditEvent({
                type: 'comment_mention_invalid',
                actorUserId: user.id,
                targetType: 'comment',
                targetId: comment.commentId,
                summary: `invalid mentions: ${invalidMentions.join(', ')}`,
                meta: { invalidMentions },
            })
        }
        addAuditEvent({
            type: 'comment_create',
            actorUserId: user.id,
            targetType: 'comment',
            targetId: comment.commentId,
            meta: { mentionCount: mentionUserIds.length },
            summary: `comment on page ${commentsListParams.pageId}`,
        })
        return {
            data: {
                commentId: comment.commentId,
                content: comment.content,
                mentionUserIds: comment.mentionUserIds,
                invalidMentions,
                createdAt: comment.createdAt,
            },
            success: true,
        }
    }

    const commentParams = matchPath(path, '/comments/:commentId')
    if (commentParams && method === 'PATCH') {
        const comment = db.comments.find(item => item.commentId === commentParams.commentId)
        if (!comment) {
            throw new MockHttpError(404, 'comment not found')
        }
        const { member } = assertAction(comment.pageId, user.id, 'comment')
        const canModerate = hasAction(member.role, member.operations, 'comment_moderate')
        const isAuthor = comment.authorId === user.id
        if (!isAuthor && !canModerate) {
            throw new MockHttpError(403, 'permission denied')
        }
        if (typeof body.content === 'string') {
            comment.content = body.content.trim()
        }
        if (typeof body.resolved === 'boolean') {
            comment.resolved = body.resolved
        }
        if (typeof body.hidden === 'boolean' && canModerate) {
            comment.hidden = body.hidden
        }
        comment.updatedAt = nowISO()
        return {
            data: {
                commentId: comment.commentId,
                updatedAt: comment.updatedAt,
            },
            success: true,
        }
    }
    if (commentParams && method === 'DELETE') {
        const comment = db.comments.find(item => item.commentId === commentParams.commentId)
        if (!comment) {
            throw new MockHttpError(404, 'comment not found')
        }
        const { member } = assertAction(comment.pageId, user.id, 'comment')
        const canModerate = hasAction(member.role, member.operations, 'comment_moderate')
        const isAuthor = comment.authorId === user.id
        if (!isAuthor && !canModerate) {
            throw new MockHttpError(403, 'permission denied')
        }
        comment.deletedAt = nowISO()
        comment.hidden = true
        comment.updatedAt = nowISO()
        return { data: { commentId: comment.commentId }, success: true }
    }

    if (method === 'GET' && path === '/notifications') {
        const status = (query.get('status') ?? 'all').trim().toLowerCase()
        const limit = coerceLimit(query.get('limit'), 20, 1, 100)
        const cursor = query.get('cursor')
        const unreadCount = db.notifications.filter(item => item.userId === user.id && !item.readAt).length
        let rows = db.notifications.filter(item => item.userId === user.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        if (status === 'unread') {
            rows = rows.filter(item => !item.readAt)
        }
        if (cursor) {
            const cursorTime = +new Date(cursor)
            if (Number.isFinite(cursorTime)) {
                rows = rows.filter(item => +new Date(item.createdAt) < cursorTime)
            }
        }
        const pageRows = rows.slice(0, limit + 1)
        const hasNext = pageRows.length > limit
        const items = pageRows.slice(0, limit).map(item => ({
            notificationId: item.notificationId,
            type: item.type,
            title: item.title,
            content: item.content,
            payload: item.payload,
            readAt: item.readAt,
            createdAt: item.createdAt,
        }))
        return {
            data: {
                unreadCount,
                nextCursor: hasNext ? (items[items.length - 1]?.createdAt ?? null) : null,
                items,
            },
            success: true,
        }
    }

    const readNoticeParams = matchPath(path, '/notifications/:id/read')
    if (readNoticeParams && method === 'PATCH') {
        const row = db.notifications.find(item => item.notificationId === readNoticeParams.id && item.userId === user.id)
        if (!row) {
            return { data: { notificationId: readNoticeParams.id, success: false }, success: true }
        }
        row.readAt = row.readAt ?? nowISO()
        addAuditEvent({
            type: 'notification_read',
            actorUserId: user.id,
            targetType: 'notification',
            targetId: row.notificationId,
            summary: `mark notification read ${row.notificationId}`,
        })
        return { data: { notificationId: readNoticeParams.id, success: true }, success: true }
    }
    if (method === 'PATCH' && path === '/notifications/read-all') {
        let affectedCount = 0
        for (const row of db.notifications) {
            if (row.userId === user.id && !row.readAt) {
                row.readAt = nowISO()
                affectedCount += 1
            }
        }
        addAuditEvent({
            type: 'notification_read_all',
            actorUserId: user.id,
            targetType: 'notification',
            targetId: null,
            summary: 'mark all notifications read',
            meta: { affectedCount },
        })
        return { data: { success: true, affectedCount }, success: true }
    }

    if (method === 'GET' && path === '/tags') {
        const tags: TagItem[] = db.tags
            .slice()
            .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
            .map(item => ({
                tagId: item.tagId,
                name: item.name,
                normalizedName: item.normalizedName,
            }))
        return { data: tags, success: true }
    }
    if (method === 'POST' && path === '/tags') {
        const name = normalizeTagName(String(body.name ?? ''))
        const normalizedName = normalizeTagKey(name)
        if (!name || !normalizedName) {
            throw new MockHttpError(400, 'tag name is required')
        }
        const duplicated = db.tags.find(item => item.normalizedName === normalizedName)
        if (duplicated) {
            return {
                data: {
                    tagId: duplicated.tagId,
                    name: duplicated.name,
                    normalizedName: duplicated.normalizedName,
                },
                success: true,
            }
        }
        const createdAt = nowISO()
        const tag: MockTag = {
            id: nextSeq('tag'),
            tagId: 'tag' + randomId(''),
            name,
            normalizedName,
            createdById: user.id,
            createdAt,
            updatedAt: createdAt,
        }
        db.tags.push(tag)
        return {
            data: {
                tagId: tag.tagId,
                name: tag.name,
                normalizedName: tag.normalizedName,
            },
            success: true,
        }
    }

    const tagParams = matchPath(path, '/tags/:tagId')
    if (tagParams && method === 'PATCH') {
        const tag = db.tags.find(item => item.tagId === tagParams.tagId)
        if (!tag) {
            throw new MockHttpError(404, 'tag not found')
        }
        const name = normalizeTagName(String(body.name ?? tag.name))
        tag.name = name
        tag.normalizedName = normalizeTagKey(name)
        tag.updatedAt = nowISO()
        return {
            data: {
                tagId: tag.tagId,
                name: tag.name,
                normalizedName: tag.normalizedName,
            },
            success: true,
        }
    }
    if (tagParams && method === 'DELETE') {
        db.tags = db.tags.filter(item => item.tagId !== tagParams.tagId)
        for (const pageId of Object.keys(db.pageTags)) {
            db.pageTags[pageId] = (db.pageTags[pageId] ?? []).filter(item => item !== tagParams.tagId)
        }
        return { data: { tagId: tagParams.tagId }, success: true }
    }

    const pageTagsParams = matchPath(path, '/page/:pageId/tags')
    if (pageTagsParams && method === 'GET') {
        assertAction(pageTagsParams.pageId, user.id, 'read', true)
        const tagIds = db.pageTags[pageTagsParams.pageId] ?? []
        const tags = tagIds
            .map(tagId => db.tags.find(item => item.tagId === tagId))
            .filter(Boolean)
            .map(tag => ({
                tagId: tag!.tagId,
                name: tag!.name,
            }))
        return { data: tags, success: true }
    }
    if (pageTagsParams && method === 'PUT') {
        assertAction(pageTagsParams.pageId, user.id, 'write')
        const rawTags = Array.isArray(body.tags) ? body.tags : []
        const normalizedMap = new Map<string, { name: string; key: string }>()
        for (const rawTag of rawTags) {
            const name = normalizeTagName(String(rawTag))
            const key = normalizeTagKey(String(rawTag))
            if (!name || !key) {
                continue
            }
            normalizedMap.set(key, { name, key })
        }

        const tagsToUse: MockTag[] = []
        for (const item of normalizedMap.values()) {
            const exists = db.tags.find(tag => tag.normalizedName === item.key)
            if (exists) {
                tagsToUse.push(exists)
                continue
            }
            const createdAt = nowISO()
            const createdTag: MockTag = {
                id: nextSeq('tag'),
                tagId: 'tag' + randomId(''),
                name: item.name,
                normalizedName: item.key,
                createdById: user.id,
                createdAt,
                updatedAt: createdAt,
            }
            db.tags.push(createdTag)
            tagsToUse.push(createdTag)
        }
        db.pageTags[pageTagsParams.pageId] = tagsToUse.map(item => item.tagId)
        enqueueSearch(pageTagsParams.pageId, 'tags_updated')
        return {
            data: {
                pageId: pageTagsParams.pageId,
                tags: tagsToUse.map(item => ({ tagId: item.tagId, name: item.name })),
            },
            success: true,
        }
    }

    if (method === 'GET' && path === '/templates') {
        const list: TemplateItem[] = db.templates
            .filter(item => !item.deletedAt)
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .map(item => ({
                templateId: item.templateId,
                name: item.name,
                emoji: item.emoji,
                title: item.title,
                description: item.description,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }))
        return { data: list, success: true }
    }
    if (method === 'POST' && path === '/templates') {
        ensureTemplateManageGlobal(user.id)
        const createdAt = nowISO()
        const template: MockTemplate = {
            id: nextSeq('template'),
            templateId: 'tpl' + randomId(''),
            name: String(body.name ?? '').trim() || '未命名模板',
            emoji: String(body.emoji ?? '馃摌'),
            title: String(body.title ?? '').trim() || '妯℃澘鏍囬',
            description: typeof body.description === 'string' ? body.description.trim() : null,
            documentUpdate: 'mock-template-update',
            createdById: user.id,
            createdAt,
            updatedAt: null,
            deletedAt: null,
        }
        db.templates.unshift(template)
        addAuditEvent({
            type: 'template_create',
            actorUserId: user.id,
            targetType: 'template',
            targetId: template.templateId,
            summary: `鍒涘缓妯℃澘 ${template.name}`,
        })
        return {
            data: {
                templateId: template.templateId,
                name: template.name,
                emoji: template.emoji,
                title: template.title,
                description: template.description,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
            },
            success: true,
        }
    }

    const tplFromPage = matchPath(path, '/templates/from-page/:pageId')
    if (tplFromPage && method === 'POST') {
        assertAction(tplFromPage.pageId, user.id, 'template_manage')
        const page = findPage(tplFromPage.pageId, true)
        const createdAt = nowISO()
        const template: MockTemplate = {
            id: nextSeq('template'),
            templateId: 'tpl' + randomId(''),
            name: `${page.title} 妯℃澘`,
            emoji: page.emoji,
            title: page.title,
            description: page.description,
            documentUpdate: 'mock-page-state',
            createdById: user.id,
            createdAt,
            updatedAt: null,
            deletedAt: null,
        }
        db.templates.unshift(template)
        addAuditEvent({
            type: 'template_from_page',
            actorUserId: user.id,
            targetType: 'template',
            targetId: template.templateId,
            summary: `鐢遍〉闈?${page.title} 鐢熸垚妯℃澘`,
        })
        return {
            data: {
                templateId: template.templateId,
                name: template.name,
                emoji: template.emoji,
                title: template.title,
                description: template.description,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
            },
            success: true,
        }
    }

    const templateParams = matchPath(path, '/templates/:templateId')
    if (templateParams && method === 'PATCH') {
        ensureTemplateManageGlobal(user.id)
        const template = db.templates.find(item => item.templateId === templateParams.templateId && !item.deletedAt)
        if (!template) {
            throw new MockHttpError(404, 'template not found')
        }
        if (typeof body.name === 'string') {
            template.name = body.name.trim()
        }
        if (typeof body.emoji === 'string') {
            template.emoji = body.emoji
        }
        if (typeof body.title === 'string') {
            template.title = body.title.trim()
        }
        if (body.description !== undefined) {
            template.description = body.description ? String(body.description).trim() : null
        }
        template.updatedAt = nowISO()
        return {
            data: {
                templateId: template.templateId,
                name: template.name,
                emoji: template.emoji,
                title: template.title,
                description: template.description,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
            },
            success: true,
        }
    }
    if (templateParams && method === 'DELETE') {
        ensureTemplateManageGlobal(user.id)
        const template = db.templates.find(item => item.templateId === templateParams.templateId && !item.deletedAt)
        if (!template) {
            throw new MockHttpError(404, 'template not found')
        }
        template.deletedAt = nowISO()
        template.updatedAt = nowISO()
        return {
            data: {
                templateId: template.templateId,
            },
            success: true,
        }
    }

    const createFromTemplate = matchPath(path, '/page/from-template/:templateId')
    if (createFromTemplate && method === 'POST') {
        const template = db.templates.find(item => item.templateId === createFromTemplate.templateId && !item.deletedAt)
        if (!template) {
            throw new MockHttpError(404, 'template not found')
        }
        const page = createPage(
            {
                emoji: template.emoji,
                title: template.title,
                description: template.description,
            },
            user.id
        )
        return { data: buildPageListItem(page), success: true }
    }

    const snapshotsList = matchPath(path, '/page/:pageId/snapshots')
    if (snapshotsList && method === 'GET') {
        assertAction(snapshotsList.pageId, user.id, 'read', true)
        const rows = db.snapshots
            .filter(item => item.pageId === snapshotsList.pageId)
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .map(item => ({
                snapshotId: item.snapshotId,
                title: item.title,
                reason: item.reason,
                createdAt: item.createdAt,
                expireAt: item.expireAt,
                createdBy: item.createdBy,
            }))
        return { data: rows, success: true }
    }
    if (snapshotsList && method === 'POST') {
        const { page } = assertAction(snapshotsList.pageId, user.id, 'read')
        const title = typeof body.title === 'string' ? body.title : page.title
        const snapshot = createSnapshot(page, user, title, 'manual')
        return {
            data: {
                snapshotId: snapshot.snapshotId,
                title: snapshot.title,
                reason: snapshot.reason,
                createdAt: snapshot.createdAt,
                expireAt: snapshot.expireAt,
            },
            success: true,
        }
    }

    const snapshotRestore = matchPath(path, '/page/:pageId/snapshots/:snapshotId/restore')
    if (snapshotRestore && method === 'POST') {
        const { page } = assertAction(snapshotRestore.pageId, user.id, 'write', true)
        const snapshot = db.snapshots.find(item => item.pageId === snapshotRestore.pageId && item.snapshotId === snapshotRestore.snapshotId)
        if (!snapshot) {
            throw new MockHttpError(404, 'snapshot not found')
        }
        createSnapshot(page, user, `${page.title} (auto backup before restore)`, 'before_restore')
        page.updatedAt = nowISO()
        page.deletedAt = null
        enqueueSearch(page.pageId, 'snapshot_restored')
        addAuditEvent({
            type: 'snapshot_restore',
            actorUserId: user.id,
            targetType: 'snapshot',
            targetId: snapshot.snapshotId,
            summary: `鎭㈠蹇収 ${snapshot.title}`,
        })
        return { data: { snapshotId: snapshot.snapshotId }, success: true }
    }

    if (method === 'GET' && path === '/search/pages') {
        processSearchJobs(30)
        const q = (query.get('q') ?? '').trim().toLowerCase()
        const tagId = (query.get('tagId') ?? '').trim()
        const cursor = query.get('cursor')
        const limit = coerceLimit(query.get('limit'), 20, 1, 50)

        const accessible = new Set(listAccessiblePages(user.id, false).map(item => item.pageId))
        let rows = db.searchIndex
            .filter(item => accessible.has(item.pageId))
            .map(item => ({
                ...item,
                page: db.pages.find(pageRow => pageRow.pageId === item.pageId),
            }))
            .filter(item => !!item.page && !item.page!.deletedAt)

        if (tagId) {
            rows = rows.filter(item => (db.pageTags[item.pageId] ?? []).includes(tagId))
        }

        if (q) {
            rows = rows.filter(item => `${item.title} ${item.bodyText} ${item.tagsText}`.toLowerCase().includes(q))
        }

        rows = rows.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))

        if (cursor) {
            rows = rows.filter(item => +new Date(item.updatedAt) < +new Date(cursor))
        }

        const slice = rows.slice(0, limit + 1)
        const hasNext = slice.length > limit
        const items = slice.slice(0, limit).map(item => ({
            pageId: item.pageId,
            title: item.title,
            updatedAt: item.updatedAt,
        }))
        return {
            data: {
                items,
                nextCursor: hasNext ? (items[items.length - 1]?.updatedAt ?? null) : null,
            },
            success: true,
        }
    }

    if (method === 'POST' && path === '/ai/chat') {
        assertRateLimit(user.id)
        const queryText = String(body.query ?? '').trim()
        if (!queryText) {
            throw new MockHttpError(400, 'query is required')
        }
        addAuditEvent({
            type: 'ai_chat',
            actorUserId: user.id,
            targetType: 'ai',
            targetId: null,
            summary: '瑙﹀彂 AI 瀵硅瘽',
            meta: { queryLength: queryText.length },
        })
        return {
            data: {
                blocks: [
                    {
                        type: 'paragraph',
                        content: `銆怣ock AI銆戝凡鏍规嵁浣犵殑闂鐢熸垚鑽夌锛?{queryText}`,
                    },
                ],
                conversationId: String(body.conversationId ?? '') || `conv-${randomId('')}`,
            },
            success: true,
        }
    }

    if (method === 'GET' && path === '/sso/providers') {
        return {
            data: db.ssoProviders,
            success: true,
        }
    }

    if (method === 'POST' && path === '/sso/simulate/start') {
        const provider = String(body.provider ?? '')
        if (!db.ssoProviders.some(item => item.key === provider)) {
            throw new MockHttpError(400, 'provider not supported')
        }
        const code = `mock-code-${randomId('')}`
        return {
            data: {
                provider,
                code,
                authorizeUrl: `/account/login?ssoProvider=${provider}&code=${code}`,
            },
            success: true,
        }
    }

    if (method === 'POST' && path === '/sso/simulate/callback') {
        const provider = String(body.provider ?? '')
        const code = String(body.code ?? '')
        if (!provider || !code) {
            throw new MockHttpError(400, 'provider and code are required')
        }
        const username = `sso_${provider.replace(/[^a-z]/g, '')}`
        let targetUser = db.users.find(item => item.username === username)
        if (!targetUser) {
            const createdAt = nowISO()
            targetUser = {
                id: nextSeq('user'),
                username,
                password: 'sso-login-only',
                departmentId: 'dept-rd',
                position: 'frontend',
                createdAt,
            }
            db.users.push(targetUser)
        }
        const token = issueToken(targetUser.id)
        addAuditEvent({
            type: 'sso_login',
            actorUserId: targetUser.id,
            targetType: 'user',
            targetId: String(targetUser.id),
            summary: `${provider} SSO 鐧诲綍`,
            meta: { provider, code },
        })
        return {
            data: {
                access_token: token,
                user: getUserView(targetUser),
            },
            success: true,
        }
    }

    if (method === 'GET' && path === '/org/mappings') {
        const users = db.users.map(item => {
            const matched = db.orgRoles.find(role => role.position === item.position)
            return {
                userId: item.id,
                username: item.username,
                departmentId: item.departmentId,
                position: item.position,
                defaultRole: matched?.defaultRole ?? 'viewer',
            }
        })
        return {
            data: {
                departments: db.departments,
                roleMappings: db.orgRoles,
                users,
            },
            success: true,
        }
    }

    if (method === 'PUT' && path === '/org/mappings') {
        const userId = Number(body.userId ?? 0)
        const departmentId = typeof body.departmentId === 'string' ? body.departmentId : ''
        const position = typeof body.position === 'string' ? body.position : ''
        const userRow = db.users.find(item => item.id === userId)
        if (!userRow) {
            throw new MockHttpError(404, 'user not found')
        }
        if (departmentId) {
            userRow.departmentId = departmentId
        }
        if (position) {
            userRow.position = position
        }
        addAuditEvent({
            type: 'org_mapping_update',
            actorUserId: user.id,
            targetType: 'user',
            targetId: String(userRow.id),
            summary: `鏇存柊缁勭粐鏄犲皠 ${userRow.username}`,
            meta: { departmentId: userRow.departmentId, position: userRow.position },
        })
        return {
            data: {
                userId: userRow.id,
                departmentId: userRow.departmentId,
                position: userRow.position,
            },
            success: true,
        }
    }

    if (method === 'GET' && path === '/audit/events') {
        const type = (query.get('type') ?? '').trim()
        const targetType = (query.get('targetType') ?? '').trim()
        const actorUserId = query.get('actorUserId')
        const actorUserIdNumber = actorUserId ? Number(actorUserId) : null
        const from = query.get('from')
        const to = query.get('to')
        const cursor = query.get('cursor')
        const limit = coerceLimit(query.get('limit'), 20, 1, 100)
        let rows = db.auditEvents.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        if (type) {
            rows = rows.filter(item => item.type === type)
        }
        if (targetType) {
            rows = rows.filter(item => item.targetType === targetType)
        }
        if (actorUserId && Number.isFinite(actorUserIdNumber)) {
            rows = rows.filter(item => item.actorUserId === actorUserIdNumber)
        }
        if (from) {
            const fromTime = +new Date(from)
            if (Number.isFinite(fromTime)) {
                rows = rows.filter(item => +new Date(item.createdAt) >= fromTime)
            }
        }
        if (to) {
            const toTime = +new Date(to)
            if (Number.isFinite(toTime)) {
                rows = rows.filter(item => +new Date(item.createdAt) <= toTime)
            }
        }
        if (cursor) {
            rows = rows.filter(item => +new Date(item.createdAt) < +new Date(cursor))
        }
        const pageRows = rows.slice(0, limit + 1)
        const hasNext = pageRows.length > limit
        const items = pageRows.slice(0, limit).map(item => ({
            eventId: item.eventId,
            type: item.type,
            actorUserId: item.actorUserId,
            targetType: item.targetType,
            targetId: item.targetId,
            summary: item.summary,
            meta: item.meta,
            createdAt: item.createdAt,
        }))
        return {
            data: {
                items,
                nextCursor: hasNext ? (items[items.length - 1]?.createdAt ?? null) : null,
            },
            success: true,
        }
    }

    if (method === 'GET' && path === '/audit/stats') {
        const days = coerceLimit(query.get('days'), 7, 1, 30)
        const now = Date.now()
        const threshold = now - days * 24 * 60 * 60 * 1000
        const rows = db.auditEvents.filter(item => +new Date(item.createdAt) >= threshold)

        const byTypeMap = new Map<string, number>()
        const actorMap = new Map<string, number>()
        const trendMap = new Map<string, number>()
        for (let i = days - 1; i >= 0; i -= 1) {
            const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            trendMap.set(date, 0)
        }

        for (const row of rows) {
            byTypeMap.set(row.type, (byTypeMap.get(row.type) ?? 0) + 1)
            const actorKey = row.actorUserId === null ? 'null' : String(row.actorUserId)
            actorMap.set(actorKey, (actorMap.get(actorKey) ?? 0) + 1)
            const date = row.createdAt.slice(0, 10)
            trendMap.set(date, (trendMap.get(date) ?? 0) + 1)
        }

        const byType = Array.from(byTypeMap.entries())
            .map(([eventType, count]) => ({ type: eventType, count }))
            .sort((a, b) => b.count - a.count)
        const topActors = Array.from(actorMap.entries())
            .map(([actorKey, count]) => ({
                actorUserId: actorKey === 'null' ? null : Number(actorKey),
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        const trend = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }))

        return {
            data: {
                days,
                total: rows.length,
                byType,
                trend,
                topActors,
            },
            success: true,
        }
    }

    if (method === 'GET' && path === '/governance/retention') {
        return {
            data: db.retentionPolicy,
            success: true,
        }
    }

    if (method === 'PUT' && path === '/governance/retention') {
        const snapshotDays = Number(body.snapshotDays ?? db.retentionPolicy.snapshotDays)
        const trashDays = Number(body.trashDays ?? db.retentionPolicy.trashDays)
        const auditDays = Number(body.auditDays ?? db.retentionPolicy.auditDays)
        db.retentionPolicy = {
            snapshotDays: Number.isFinite(snapshotDays) ? Math.max(1, Math.floor(snapshotDays)) : db.retentionPolicy.snapshotDays,
            trashDays: Number.isFinite(trashDays) ? Math.max(1, Math.floor(trashDays)) : db.retentionPolicy.trashDays,
            auditDays: Number.isFinite(auditDays) ? Math.max(1, Math.floor(auditDays)) : db.retentionPolicy.auditDays,
        }
        cleanupRetention()
        addAuditEvent({
            type: 'retention_update',
            actorUserId: user.id,
            targetType: 'governance',
            targetId: null,
            summary: '鏇存柊鐣欏瓨绛栫暐',
            meta: db.retentionPolicy as unknown as Record<string, unknown>,
        })
        return {
            data: db.retentionPolicy,
            success: true,
        }
    }

    if (method === 'GET' && path === '/observability/dashboard') {
        processSearchJobs(20)
        const unread = db.notifications.filter(item => item.userId === user.id && !item.readAt).length
        const pendingJobs = db.searchJobs.filter(item => !item.processedAt).length
        return {
            data: {
                mode: 'mock',
                generatedAt: nowISO(),
                windows: {
                    aiRateLimitSeconds: RATE_LIMIT_WINDOW_MS / 1000,
                    auditTrendDays: 7,
                },
                definitions: {
                    collaboration: 'current websocket connection snapshot in mock runtime',
                    searchIndex: 'pending jobs and indexed pages at request time',
                    aiRateLimit: 'rate-limit hit count during the current mock runtime',
                    audit: 'total retained audit events after retention cleanup',
                },
                collaboration: {
                    wsGateway: '/doc-yjs',
                    currentConnections: db.metrics.collaborationConnections,
                },
                searchIndex: {
                    pendingJobs,
                    indexedPages: db.searchIndex.length,
                },
                aiRateLimit: {
                    windowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
                    maxRequestPerWindow: RATE_LIMIT_MAX,
                    hitCount: db.metrics.rateLimitHits,
                },
                notifications: {
                    unreadCount: unread,
                },
                audit: {
                    totalEvents: db.auditEvents.length,
                },
            },
            success: true,
        }
    }

    if (method === 'POST' && path === '/audit/emit') {
        const type = String(body.type ?? 'custom_event')
        const summary = String(body.summary ?? 'custom event')
        addAuditEvent({
            type,
            actorUserId: user.id,
            targetType: String(body.targetType ?? 'unknown'),
            targetId: body.targetId ? String(body.targetId) : null,
            summary,
            meta: typeof body.meta === 'object' && body.meta ? (body.meta as Record<string, unknown>) : {},
        })
        return {
            data: { success: true },
            success: true,
        }
    }

    return null
}

export const handleMockRequest = async (config: InternalAxiosRequestConfig) => {
    cleanupRetention()
    const method = ((config.method ?? 'GET').toUpperCase() as HttpMethod) ?? 'GET'
    const path = normalizePath(config.url)
    const query = parseQuery(config)
    const body = parseJsonBody(config)

    const publicResult = handleAuthRoutes(method, path, body)
    if (publicResult) {
        processSearchJobs(10)
        persistDb()
        return publicResult
    }

    const user = ensureAuth(config)
    const protectedResult = handleProtectedRoutes(method, path, query, body, user)
    if (protectedResult) {
        processSearchJobs(10)
        persistDb()
        return protectedResult
    }

    throw new MockHttpError(404, `mock route not found: ${method} ${path}`)
}

export const getMockMode = () => 'mock'
