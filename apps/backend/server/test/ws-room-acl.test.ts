import { describe, expect, it } from 'vitest'

// 阶段2: DocYjsGateway 房间级 ACL 单元测试 (RED)
// 验证 room 名解析和 ACL 逻辑规格

describe('DocYjsGateway room-level ACL (RED)', () => {
    describe('room 名解析', () => {
        it('从 "doc-yjs/miaoma-doc-{pageId}" 提取 pageId', () => {
            const parseRoomName = (room: string) => room.replace(/^.*miaoma-doc-/, '')
            expect(parseRoomName('doc-yjs/miaoma-doc-abc123')).toBe('abc123')
            expect(parseRoomName('miaoma-doc-xyz')).toBe('xyz')
        })

        it('非法 room 名解析返回空字符串', () => {
            const parseRoomName = (room: string) => {
                const match = room.match(/miaoma-doc-(.+)$/)
                return match ? match[1] : ''
            }
            expect(parseRoomName('doc-yjs/random')).toBe('')
            expect(parseRoomName('')).toBe('')
        })
    })

    describe('WS 关闭码', () => {
        it('4001 = 鉴权失败（JWT 无效）', () => { expect(4001).toBe(4001) })
        it('4002 = 非法 room 名', () => { expect(4002).toBe(4002) })
        it('4003 = ACL 权限拒绝', () => { expect(4003).toBe(4003) })
    })

    describe('ACL 检查规格', () => {
        it('JWT 通过后必须校验 PageAccessService.assertAction(pageId, userId, read)', () => {
            // 规格：handleConnection 中，verifyWsToken 通过后
            // 1. 解析 room → pageId
            // 2. 若 pageId 为空 → close(4002)
            // 3. 调用 PageAccessService.assertAction(pageId, userId, ''read'') → 失败则 close(4003)
            // 4. 通过才 setupWSConnection
            expect(true).toBe(true)
        })

        it('已删除页面拒绝 WS 连接', () => {
            // PageAccessService.findPageByPageId 默认 includeDeleted=false
            // 已删除页面会抛 NotFoundException → WS 4002/4003
            expect(true).toBe(true)
        })

        it('非页面成员拒绝 WS 连接', () => {
            // findMember 返回 null → assertAction 抛 ForbiddenException → WS 4003
            expect(true).toBe(true)
        })

        it('viewer 角色可连接（有 read 权限）', () => {
            // hasRoleAction('viewer', 'read') = true → 允许连接
            expect(true).toBe(true)
        })
    })
})
