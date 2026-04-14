import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards, UsePipes } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { PageService } from '../page/page.service'
import { CreateTagDto, createTagSchema, UpdateTagDto, updateTagSchema } from './tag.dto'

@Controller('tags')
@UseGuards(AuthGuard('jwt'))
export class TagController {
    constructor(private readonly pageService: PageService) {}

    @Get()
    async list() {
        const data = await this.pageService.listTags()
        return { data, success: true }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createTagSchema))
    async create(@Body() body: CreateTagDto, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.createTag(body.name, req.user.id)
        return { data, success: true }
    }

    @Patch(':tagId')
    @UsePipes(new ZodValidationPipe(updateTagSchema))
    async update(@Param() params: { tagId: string }, @Body() body: UpdateTagDto) {
        const data = await this.pageService.updateTag(params.tagId, body.name)
        return { data, success: true }
    }

    @Delete(':tagId')
    async delete(@Param() params: { tagId: string }) {
        const data = await this.pageService.deleteTag(params.tagId)
        return { data, success: true }
    }
}
