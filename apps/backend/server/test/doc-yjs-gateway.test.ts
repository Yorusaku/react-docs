import { AddressInfo } from 'node:net'

import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { WsAdapter } from '@nestjs/platform-ws'
import { Test } from '@nestjs/testing'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'

import { docs } from '../src/fundamentals/yjs-postgresql/utils'
import { DocYjsGateway, parsePageIdFromRoom } from '../src/modules/doc-yjs/doc-yjs.gateway'
import { PageAccessService } from '../src/modules/page/page-access.service'
import { UserService } from '../src/modules/user/user.service'

const JWT_SECRET = process.env.JWT_SECRET as string

describe('DocYjsGateway 房间解析（真实实现）', () => {
    it('从 room 名 miaoma-doc-{pageId} 提取 pageId', () => {
        expect(parsePageIdFromRoom('miaoma-doc-abc123')).toBe('abc123')
    })

    it('非法 room 名返回 null', () => {
        expect(parsePageIdFromRoom('random')).toBeNull()
        expect(parsePageIdFromRoom('doc-yjs/random')).toBeNull()
        expect(parsePageIdFromRoom('')).toBeNull()
        expect(parsePageIdFromRoom(null)).toBeNull()
    })
})

describe('DocYjsGateway WebSocket 升级路由与 ACL', () => {
    let app: INestApplication
    let port: number
    let validToken: string
    const assertAction = vi.fn()
    const sockets: WebSocket[] = []

    beforeAll(async () => {
        const jwtService = new JwtService({ secret: JWT_SECRET })
        validToken = jwtService.sign({ sub: 1 })

        const moduleRef = await Test.createTestingModule({
            providers: [
                DocYjsGateway,
                { provide: JwtService, useValue: jwtService },
                { provide: UserService, useValue: { findById: async () => ({ id: 1 }) } },
                { provide: PageAccessService, useValue: { assertAction } },
            ],
        }).compile()

        app = moduleRef.createNestApplication()
        app.useWebSocketAdapter(new WsAdapter(app))
        await app.listen(0)
        port = (app.getHttpServer().address() as AddressInfo).port
    })

    afterAll(async () => {
        await app?.close()
    })

    afterEach(() => {
        sockets.forEach(socket => socket.terminate())
        sockets.length = 0
        assertAction.mockReset()
        docs.forEach((doc, key) => {
            doc.destroy()
            docs.delete(key)
        })
    })

    type Outcome = { event: string; code?: number }

    // open 会先于服务端 close 触发，因此不能在 open 时就判定成功，
    // 必须继续等待 close/error；超时前始终未关闭才算「连接被接受」。
    const attempt = (path: string, waitMs = 2000) =>
        new Promise<Outcome>(resolve => {
            const socket = new WebSocket(`ws://127.0.0.1:${port}${path}`)
            sockets.push(socket)
            let opened = false
            let settled = false
            const timer = setTimeout(() => {
                if (!settled) {
                    settled = true
                    resolve({ event: opened ? 'accepted' : 'timeout' })
                }
            }, waitMs)
            const done = (outcome: Outcome) => {
                if (settled) {
                    return
                }
                settled = true
                clearTimeout(timer)
                resolve(outcome)
            }
            socket.on('open', () => {
                opened = true
            })
            socket.on('unexpected-response', () => done({ event: 'unexpected-response' }))
            socket.on('error', () => done({ event: 'error' }))
            socket.on('close', code => done({ event: 'close', code }))
        })

    it('y-websocket 的 query 房间 URL 可升级并进入网关鉴权（无效 token 关闭码 4001）', async () => {
        const outcome = await attempt('/doc-yjs?room=miaoma-doc-abc123&token=invalid-token')
        expect(outcome).toEqual({ event: 'close', code: 4001 })
    })

    it('旧的房间子路径在升级阶段被拒（记录缺陷形状，防止回退）', async () => {
        const outcome = await attempt('/doc-yjs/miaoma-doc-abc123?token=invalid-token', 1500)
        expect(outcome.event).toBe('error')
    })

    it('裸路径 /doc-yjs 可升级并进入网关鉴权（无效 token 关闭码 4001）', async () => {
        const outcome = await attempt('/doc-yjs')
        expect(outcome).toEqual({ event: 'close', code: 4001 })
    })

    it('缺少 room 参数时关闭码 4002', async () => {
        const outcome = await attempt(`/doc-yjs?token=${validToken}`)
        expect(outcome).toEqual({ event: 'close', code: 4002 })
    })

    it('room 名非法时关闭码 4002', async () => {
        const outcome = await attempt(`/doc-yjs?room=random&token=${validToken}`)
        expect(outcome).toEqual({ event: 'close', code: 4002 })
    })

    it('无 read 权限时关闭码 4003，且按 pageId/userId/read 校验', async () => {
        assertAction.mockRejectedValue(new Error('forbidden'))
        const outcome = await attempt(`/doc-yjs?room=miaoma-doc-abc123&token=${validToken}`)
        expect(outcome).toEqual({ event: 'close', code: 4003 })
        expect(assertAction).toHaveBeenCalledWith('abc123', 1, 'read')
    })

    it('viewer 有 read 权限时连接被接受，并使用历史持久化键建立 Y.Doc', async () => {
        assertAction.mockResolvedValue(undefined)
        const outcome = await attempt(`/doc-yjs?room=miaoma-doc-abc123&token=${validToken}`, 500)
        expect(outcome).toEqual({ event: 'accepted' })
        expect(assertAction).toHaveBeenCalledWith('abc123', 1, 'read')
        expect(docs.has('doc-yjs/miaoma-doc-abc123')).toBe(true)
    })
})
