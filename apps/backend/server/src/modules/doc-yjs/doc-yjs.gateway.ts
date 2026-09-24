import { IncomingMessage } from 'node:http'

import { Inject, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, WebSocket } from 'ws'

import { collabConnectionsActive } from '../../fundamentals/observability/metrics.controller'
import { setupWSConnection } from '../../fundamentals/yjs-postgresql/utils'
import { PageAccessService } from '../page/page-access.service'
import { UserService } from '../user/user.service'
import { resolveWsToken, verifyWsToken } from './ws-auth'

// 房间名必须放在 query 而不是路径里：Nest WsAdapter 的 upgrade 路由只做 pathname 精确匹配，
// y-websocket 会把 roomname 拼进路径，导致 /doc-yjs/{room} 在升级阶段就被 socket.destroy。
export const parsePageIdFromRoom = (room: string | null): string | null => {
    if (!room) {
        return null
    }
    const match = room.match(/^miaoma-doc-(.+)$/)
    return match ? match[1] : null
}

export const resolveWsRoom = (request: IncomingMessage): string | null => {
    const url = request.url ?? '/'
    const parsedUrl = new URL(url, 'ws://localhost')
    return parsedUrl.searchParams.get('room')
}

// Y.Doc 名（也就是持久化 key）沿用改造前的形状，避免历史文档读不回来。
const docNameByPageId = (pageId: string) => `doc-yjs/miaoma-doc-${pageId}`

@WebSocketGateway({
    path: 'doc-yjs',
})
export class DocYjsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @Inject(JwtService)
        private readonly jwtService: JwtService,
        @Inject(UserService)
        private readonly userService: UserService,
        @Inject(PageAccessService)
        private readonly pageAccessService: PageAccessService
    ) {}

    @WebSocketServer() server: Server

    @SubscribeMessage('ping')
    ping() {
        return 'pong'
    }

    async handleConnection(connection: WebSocket, request: IncomingMessage) {
        // 鉴权与 ACL 校验是异步的，客户端可能在 open 后立刻发送数据包。
        // 先把这些早到的消息缓存起来，校验通过后交给 setupWSConnection 按序回放，避免丢失。
        const pendingMessages: ArrayBuffer[] = []
        const bufferEarlyMessage = (message: ArrayBuffer) => {
            pendingMessages.push(message)
        }
        connection.on('message', bufferEarlyMessage)

        // 1. 提取并校验 JWT
        const token = resolveWsToken(request)
        if (!token) {
            connection.close(4001, 'Unauthorized')
            return
        }

        let userId: number
        try {
            const payload = verifyWsToken(this.jwtService, token)
            if (!payload?.sub) {
                connection.close(4001, 'Unauthorized')
                return
            }
            userId = payload.sub

            const user = await this.userService.findById(userId)
            if (!user) {
                connection.close(4001, 'Unauthorized')
                return
            }
        } catch (error) {
            Logger.warn(`WS auth failed: ${(error as Error).message}`)
            connection.close(4001, 'Unauthorized')
            return
        }

        // 2. 解析 query 中的 room 名 → pageId
        const room = resolveWsRoom(request)
        const pageId = parsePageIdFromRoom(room)
        if (!pageId) {
            Logger.warn(`WS invalid room name: ${room ?? ''}`)
            connection.close(4002, 'Invalid room')
            return
        }

        // 3. room 级 ACL 校验：必须有 page read 权限
        try {
            await this.pageAccessService.assertAction(pageId, userId, 'read')
        } catch {
            Logger.warn(`WS ACL denied: pageId=${pageId} userId=${userId}`)
            connection.close(4003, 'Forbidden')
            return
        }

        // 4. 全部通过，建立 Yjs 连接
        connection.off('message', bufferEarlyMessage)
        setupWSConnection(connection, request, {
            docName: docNameByPageId(pageId),
            pendingMessages,
            canWrite: async () => {
                try {
                    await this.pageAccessService.assertAction(pageId, userId, 'write')
                    return true
                } catch {
                    return false
                }
            },
        })
        collabConnectionsActive.inc()
        Logger.log(`WS connected: userId=${userId} pageId=${pageId}`)
    }

    handleDisconnect() {
        Logger.log('Client disconnected')
        collabConnectionsActive.dec()
    }

    @SubscribeMessage('doc-update')
    docUpdate(_client: WebSocket, payload: unknown) {
        return payload
    }
}
