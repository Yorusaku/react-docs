import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards, UsePipes } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { CreateTemplateDto, createTemplateSchema, UpdateTemplateDto, updateTemplateSchema } from './template.dto'
import { TemplateService } from './template.service'

@Controller('templates')
@UseGuards(AuthGuard('jwt'))
export class TemplateController {
    constructor(private readonly templateService: TemplateService) {}

    @Get()
    async list() {
        const data = await this.templateService.list()
        return { data, success: true }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createTemplateSchema))
    async create(@Body() body: CreateTemplateDto, @Request() req: { user: { id: number } }) {
        const data = await this.templateService.create({
            name: body.name ?? '',
            emoji: body.emoji ?? '',
            title: body.title ?? '',
            description: body.description,
            createdById: req.user.id,
            documentUpdate: '',
        })
        return { data, success: true }
    }

    @Post('from-page/:pageId')
    async createFromPage(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.templateService.createFromPage(params.pageId, req.user.id)
        return { data, success: true }
    }

    @Patch(':templateId')
    @UsePipes(new ZodValidationPipe(updateTemplateSchema))
    async update(@Param() params: { templateId: string }, @Body() body: UpdateTemplateDto, @Request() req: { user: { id: number } }) {
        const data = await this.templateService.update(params.templateId, req.user.id, body)
        return { data, success: true }
    }

    @Delete(':templateId')
    async remove(@Param() params: { templateId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.templateService.remove(params.templateId, req.user.id)
        return { data, success: true }
    }
}
