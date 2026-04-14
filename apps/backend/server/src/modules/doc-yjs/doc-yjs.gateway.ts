import { IncomingMessage } from 'node:http'

import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, WebSocket } from 'ws'

import { setupWSConnection } from '../../fundamentals/yjs-postgresql/utils'
import { UserService } from '../user/user.service'
import { resolveWsToken, verifyWsToken } from './ws-auth'

@WebSocketGateway({
    path: 'doc-yjs',
})
export class DocYjsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    @WebSocketServer() server: Server

    @SubscribeMessage('ping')
    ping() {
        return 'pong'
    }

    async handleConnection(connection: WebSocket, request: IncomingMessage) {
        const token = resolveWsToken(request)
        if (!token) {
            connection.close(4001, 'Unauthorized')
            return
        }

        try {
            const payload = verifyWsToken(this.jwtService, token)
            if (!payload?.sub) {
                connection.close(4001, 'Unauthorized')
                return
            }

            const user = await this.userService.findById(payload.sub)
            if (!user) {
                connection.close(4001, 'Unauthorized')
                return
            }

            setupWSConnection(connection, request)
        } catch (error) {
            Logger.warn(`WS auth failed: ${(error as Error).message}`)
            connection.close(4001, 'Unauthorized')
        }
    }

    handleDisconnect() {
        Logger.log('Client disconnected')
    }

    @SubscribeMessage('doc-update')
    docUpdate(_client: WebSocket, payload: unknown) {
        return payload
    }
}
