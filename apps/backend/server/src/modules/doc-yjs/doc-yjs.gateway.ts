import { IncomingMessage } from 'node:http'

import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, WebSocket } from 'ws'

import { collabConnectionsActive } from '../../fundamentals/observability/metrics.controller'
import { setupWSConnection } from '../../fundamentals/yjs-postgresql/utils'
import { PageAccessService } from '../page/page-access.service'
import { UserService } from '../user/user.service'
import { resolveWsToken, verifyWsToken } from './ws-auth'

// 从 room 名中提取 pageId: "doc-yjs/miaoma-doc-{pageId}" → pageId
const parsePageIdFromRoom = (url: string): string | null => {
    const match = url.match(/miaoma-doc-(.+)$/)
    return match ? match[1] : null
}

@WebSocketGateway({
    path: 'doc-yjs',
})
export class DocYjsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly pageAccessService: PageAccessService,
    ) {}

    @WebSocketServer() server: Server

    @SubscribeMessage('ping')
    ping() {
        return 'pong'
    }

    async handleConnection(connection: WebSocket, request: IncomingMessage) {
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
        } catch {
            Logger.warn(`WS auth failed: ${(error as Error).message}`)
            connection.close(4001, 'Unauthorized')
            return
        }

        // 2. 解析 room 名 → pageId
        const url = request.url ?? '/'
        const pageId = parsePageIdFromRoom(url)
        if (!pageId) {
            Logger.warn(`WS invalid room name: ${url}`)
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
        setupWSConnection(connection, request)
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
