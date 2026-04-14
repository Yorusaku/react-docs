import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { TemplateService } from './template.service'

@Controller('page')
@UseGuards(AuthGuard('jwt'))
export class TemplatePageController {
    constructor(private readonly templateService: TemplateService) {}

    @Post('from-template/:templateId')
    async createPage(@Param() params: { templateId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.templateService.createPageFromTemplate(params.templateId, req.user.id)
        return { data, success: true }
    }
}
