import { Body, Controller, Post, Req, UseGuards, UsePipes } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { AiRewriteDto, aiRewriteSchema } from './ai.dto'
import { AiService } from './ai.service'

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('rewrite')
    @UsePipes(new ZodValidationPipe(aiRewriteSchema))
    async rewrite(@Body() body: AiRewriteDto, @Req() req: { user: { id: number } }) {
        const data = await this.aiService.rewrite(body, req.user.id)
        return { data, success: true }
    }
}
