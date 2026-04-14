import { BadGatewayException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'

import { AiChatDto } from './ai.dto'

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name)
    private readonly windowMs = 60_000
    private readonly maxRequestPerWindow = 20
    private readonly requestWindowByUser = new Map<number, { startAt: number; count: number }>()

    private assertRateLimit(userId: number) {
        const now = Date.now()
        const prev = this.requestWindowByUser.get(userId)

        if (!prev || now - prev.startAt > this.windowMs) {
            this.requestWindowByUser.set(userId, { startAt: now, count: 1 })
            return
        }

        if (prev.count >= this.maxRequestPerWindow) {
            throw new HttpException('AI request too frequent, please retry later', HttpStatus.TOO_MANY_REQUESTS)
        }

        prev.count += 1
        this.requestWindowByUser.set(userId, prev)
    }

    async chat(payload: AiChatDto, user: { id: number; username?: string }, ip?: string) {
        this.assertRateLimit(user.id)

        const baseUrl = process.env.DIFY_API_BASE_URL ?? 'https://api.dify.ai'
        const apiKey = process.env.DIFY_API_KEY
        if (!apiKey) {
            throw new InternalServerErrorException('AI service is not configured')
        }

        this.logger.log(`[AI_AUDIT] userId=${user.id} username=${user.username ?? ''} ip=${ip ?? ''} queryLength=${payload.query.length}`)

        const response = await fetch(`${baseUrl}/v1/chat-messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: {},
                query: payload.query,
                response_mode: 'blocking',
                conversation_id: payload.conversationId ?? '',
                user: String(user.id),
            }),
        })

        if (!response.ok) {
            const text = await response.text()
            this.logger.error(`[AI_ERROR] status=${response.status} body=${text}`)
            throw new BadGatewayException('AI upstream request failed')
        }

        const data = (await response.json()) as { answer?: string; conversation_id?: string }

        try {
            const blocks = JSON.parse(data.answer ?? '[]')
            if (!Array.isArray(blocks)) {
                throw new Error('blocks must be array')
            }

            return {
                blocks,
                conversationId: data.conversation_id ?? '',
            }
        } catch (error) {
            this.logger.error(`[AI_PARSE_ERROR] ${(error as Error).message}`)
            throw new BadGatewayException('AI response format invalid')
        }
    }
}
