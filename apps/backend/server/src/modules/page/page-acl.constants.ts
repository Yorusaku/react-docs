export const DOC_ROLES = ['owner', 'editor', 'commenter', 'viewer'] as const

export type DocRole = (typeof DOC_ROLES)[number]

export const DOC_OPERATIONS = [
    'share',
    'member_manage',
    'delete',
    'restore',
    'export',
    'comment_moderate',
    'template_manage',
    'invite_user',
] as const

export type DocOperation = (typeof DOC_OPERATIONS)[number]

export type DocAction = 'read' | 'write' | 'comment' | DocOperation

const roleActionMap: Record<DocRole, Set<DocAction>> = {
    owner: new Set<DocAction>([
        'read',
        'write',
        'comment',
        'share',
        'member_manage',
        'delete',
        'restore',
        'export',
        'comment_moderate',
        'template_manage',
        'invite_user',
    ]),
    editor: new Set<DocAction>(['read', 'write', 'comment']),
    commenter: new Set<DocAction>(['read', 'comment']),
    viewer: new Set<DocAction>(['read']),
}

export const isDocRole = (value: string): value is DocRole => DOC_ROLES.includes(value as DocRole)

export const isDocOperation = (value: string): value is DocOperation => DOC_OPERATIONS.includes(value as DocOperation)

export const hasRoleAction = (role: DocRole, action: DocAction) => roleActionMap[role].has(action)
