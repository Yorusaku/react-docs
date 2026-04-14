import { Body, Controller, Post, Req, UseGuards, UsePipes } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { AiChatDto, aiChatSchema } from './ai.dto'
import { AiService } from './ai.service'

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('chat')
    @UsePipes(new ZodValidationPipe(aiChatSchema))
    async chat(@Body() body: AiChatDto, @Req() req: { user: { id: number; username?: string }; ip?: string }) {
        const data = await this.aiService.chat(body, req.user, req.ip)
        return { data, success: true }
    }
}
