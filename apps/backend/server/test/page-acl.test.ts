import { describe, expect, it } from 'vitest'

import { hasRoleAction } from '../src/modules/page/page-acl.constants'

describe('page acl', () => {
    it('owner should have all actions', () => {
        expect(hasRoleAction('owner', 'read')).toBe(true)
        expect(hasRoleAction('owner', 'write')).toBe(true)
        expect(hasRoleAction('owner', 'template_manage')).toBe(true)
    })

    it('viewer should only have read action', () => {
        expect(hasRoleAction('viewer', 'read')).toBe(true)
        expect(hasRoleAction('viewer', 'write')).toBe(false)
        expect(hasRoleAction('viewer', 'comment')).toBe(false)
        expect(hasRoleAction('viewer', 'share')).toBe(false)
    })

    it('editor should have write/comment but not member management', () => {
        expect(hasRoleAction('editor', 'read')).toBe(true)
        expect(hasRoleAction('editor', 'write')).toBe(true)
        expect(hasRoleAction('editor', 'comment')).toBe(true)
        expect(hasRoleAction('editor', 'member_manage')).toBe(false)
    })
})
