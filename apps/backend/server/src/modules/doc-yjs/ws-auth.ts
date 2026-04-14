import { IncomingMessage } from 'node:http'

import { JwtService } from '@nestjs/jwt'

import { jwtConstants } from '../auth/constants'

export const resolveWsToken = (request: IncomingMessage) => {
    const url = request.url ?? '/'
    const parsedUrl = new URL(url, 'ws://localhost')

    const queryToken = parsedUrl.searchParams.get('token')
    if (queryToken) {
        return queryToken
    }

    const authorization = request.headers?.authorization
    if (authorization?.startsWith('Bearer ')) {
        return authorization.slice('Bearer '.length)
    }

    return null
}

export const verifyWsToken = (jwtService: JwtService, token: string) => {
    return jwtService.verify<{ sub?: number }>(token, {
        secret: jwtConstants.secret,
    })
}
