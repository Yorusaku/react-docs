import {
    BadGatewayException,
    GatewayTimeoutException,
    HttpException,
    HttpStatus,
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common'

import { PageAccessService } from '../page/page-access.service'
import { AiRewriteDto } from './ai.dto'

@Injectable()
export class AiService {
    constructor(private readonly pageAccessService: PageAccessService) {}

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
        if (prev.count >= this.maxRequestPerWindow) throw new HttpException('AI request too frequent', HttpStatus.TOO_MANY_REQUESTS)
        prev.count += 1
    }

    async rewrite(payload: AiRewriteDto, userId: number) {
        await this.pageAccessService.assertAction(payload.pageId, userId, 'write')
        this.assertRateLimit(userId)
        const baseUrl = process.env.AI_API_BASE_URL?.replace(/\/$/, '')
        const apiKey = process.env.AI_API_KEY
        const model = process.env.AI_MODEL
        if (!baseUrl || !apiKey || !model) throw new ServiceUnavailableException('AI service is not configured')

        const instruction =
            payload.action === 'polish'
                ? '润色以下文字，使表达清晰自然，保留原意。只输出改写后的文字。'
                : '精简以下文字，保留主要意思。只输出改写后的文字。'
        let response: Response
        try {
            response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    stream: false,
                    messages: [
                        { role: 'system', content: instruction },
                        { role: 'user', content: payload.text },
                    ],
                }),
                signal: AbortSignal.timeout(20000),
            })
        } catch (error) {
            if (['TimeoutError', 'AbortError'].includes((error as Error).name)) throw new GatewayTimeoutException('AI request timed out')
            throw new BadGatewayException('AI upstream unavailable')
        }
        if (!response.ok) throw new BadGatewayException('AI upstream request failed')
        let data: { choices?: Array<{ message?: { content?: unknown } }> }
        try {
            data = await response.json()
        } catch {
            throw new BadGatewayException('AI response format invalid')
        }
        const text = data.choices?.[0]?.message?.content
        if (typeof text !== 'string' || !text.trim() || text.length > 8000) throw new BadGatewayException('AI response format invalid')
        return { text: text.trim() }
    }
}
