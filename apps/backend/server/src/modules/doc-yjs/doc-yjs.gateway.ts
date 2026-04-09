/*
 * Copyright (c) 2024 Miaoma Academy @Heyi
 * All rights reserved.
 * Internal learning project. Not intended for open-source distribution.
 */
import { Logger, OnModuleInit } from '@nestjs/common'
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Request } from 'express'
import { Server } from 'ws'

import { setupWSConnection } from '../../fundamentals/yjs-postgresql/utils'

// This gateway is the entry point for collaborative editing.
// The frontend y-websocket client connects to /doc-yjs, then the low-level
// Yjs sync logic takes over inside setupWSConnection.
@WebSocketGateway({
    path: 'doc-yjs',
})
export class DocYjsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    onModuleInit() {}

    // The server instance is available if we ever want manual ws broadcasting.
    @WebSocketServer() server: Server

    // Simple demo event. Real Yjs syncing does not depend on this message.
    @SubscribeMessage('ping')
    ping() {
        return 'pong'
    }

    // Called when the browser opens a WebSocket connection to /doc-yjs.
    // setupWSConnection handles room binding, sync, awareness, and persistence hooks.
    handleConnection(connection: WebSocket, request: Request) {
        // We can handle authentication of user like below
        // const token = getCookie(request?.headers?.cookie, 'auth_token');
        // const ERROR_CODE_WEBSOCKET_AUTH_FAILED = 4000;
        // if (!token) {
        //   connection.close(ERROR_CODE_WEBSOCKET_AUTH_FAILED);
        // } else {
        //   const signedJwt = this.authService.verifyToken(token);
        //   if (!signedJwt) connection.close(ERROR_CODE_WEBSOCKET_AUTH_FAILED);
        //   else {
        //     const docName = getCookie(request?.headers?.cookie, 'roomName');
        //     setupWSConnection(connection, request, { ...(docName && { docName }) });
        //   }
        // }

        setupWSConnection(connection, request)
    }

    // Connection cleanup is mostly done in closeConn inside utils.ts.
    handleDisconnect() {
        Logger.log(`Client disconnected`)
    }

    // Demo message. Real document updates are exchanged by Yjs binary protocol.
    @SubscribeMessage('doc-update')
    docUpdate(client: any, payload: any) {
        Logger.log(`doc-update, payload: ${JSON.stringify(payload)}`)

        return payload
    }
}
