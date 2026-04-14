import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards, UsePipes } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { nanoid } from 'nanoid'

import { PageEntity } from '../../entities/page.entity'
import { UserEntity } from '../../entities/user.entity'
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import {
    CreatePageDto,
    createPageSchema,
    CreateSnapshotDto,
    createSnapshotSchema,
    DeletePageDto,
    deletePageSchema,
    InviteMemberDto,
    inviteMemberSchema,
    UpdateAclDto,
    updateAclSchema,
    UpdatePageDto,
    updatePageSchema,
    UpdatePageTagsDto,
    updatePageTagsSchema,
} from './page.dto'
import { PageService } from './page.service'

@Controller('page')
@UseGuards(AuthGuard('jwt'))
export class PageController {
    constructor(private readonly pageService: PageService) {}

    @Get('graph')
    async graph(@Request() req: { user: { id: number } }) {
        const graph = await this.pageService.graph(req.user.id)
        return { data: graph, success: true }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createPageSchema))
    async create(@Body() body: CreatePageDto, @Request() req: { user: { id: number } }) {
        const user = new UserEntity()
        user.id = req.user.id

        const page = new PageEntity(body)
        page.pageId = 'page' + nanoid(6)

        const created = await this.pageService.create({ ...page, user }, req.user.id)
        return { data: created, success: true }
    }

    @Put()
    @UsePipes(new ZodValidationPipe(updatePageSchema))
    async update(@Body() body: UpdatePageDto, @Request() req: { user: { id: number } }) {
        const updated = await this.pageService.update({
            pageId: body.pageId,
            title: body.title,
            userId: req.user.id,
        })
        return { data: updated, success: true }
    }

    @Get()
    async list(@Request() req: { user: { id: number } }) {
        const list = await this.pageService.list({ userId: req.user.id })
        return { data: list, success: true }
    }

    @Get('trash')
    async listTrash(@Request() req: { user: { id: number } }) {
        const list = await this.pageService.listTrash({ userId: req.user.id })
        return { data: list, success: true }
    }

    @Get(':pageId')
    async fetch(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const page = await this.pageService.fetch({ pageId: params.pageId, userId: req.user.id })
        return { data: page, success: true }
    }

    @Delete()
    @UsePipes(new ZodValidationPipe(deletePageSchema))
    async delete(@Body() body: DeletePageDto, @Request() req: { user: { id: number } }) {
        const result = await this.pageService.softDelete({ pageId: body.pageId, userId: req.user.id })
        return { data: result, success: true }
    }

    @Post(':pageId/restore')
    async restore(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.restore({ pageId: params.pageId, userId: req.user.id })
        return { data, success: true }
    }

    @Delete(':pageId/permanent')
    async permanentDelete(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.permanentDelete({ pageId: params.pageId, userId: req.user.id })
        return { data, success: true }
    }

    @Get(':pageId/acl')
    async getAcl(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.getAcl(params.pageId, req.user.id)
        return { data, success: true }
    }

    @Put(':pageId/acl')
    @UsePipes(new ZodValidationPipe(updateAclSchema))
    async updateAcl(@Param() params: { pageId: string }, @Body() body: UpdateAclDto, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.updateAcl(
            params.pageId,
            req.user.id,
            (body.members ?? []).map(item => ({
                userId: item.userId ?? 0,
                role: item.role ?? 'viewer',
                operations: item.operations ?? [],
            }))
        )
        return { data, success: true }
    }

    @Post(':pageId/members/invite')
    @UsePipes(new ZodValidationPipe(inviteMemberSchema))
    async inviteMember(@Param() params: { pageId: string }, @Body() body: InviteMemberDto, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.inviteMember(params.pageId, req.user.id, {
            username: body.username ?? '',
            role: body.role ?? 'viewer',
            operations: body.operations ?? [],
        })
        return { data, success: true }
    }

    @Delete(':pageId/members/:userId')
    async removeMember(@Param() params: { pageId: string; userId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.removeMember(params.pageId, req.user.id, Number(params.userId))
        return { data, success: true }
    }

    @Get(':pageId/tags')
    async listPageTags(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.listPageTags(params.pageId, req.user.id)
        return { data, success: true }
    }

    @Put(':pageId/tags')
    @UsePipes(new ZodValidationPipe(updatePageTagsSchema))
    async updatePageTags(@Param() params: { pageId: string }, @Body() body: UpdatePageTagsDto, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.updatePageTags(params.pageId, req.user.id, body.tags)
        return { data, success: true }
    }

    @Get(':pageId/snapshots')
    async listSnapshots(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.listSnapshots(params.pageId, req.user.id)
        return { data, success: true }
    }

    @Post(':pageId/snapshots')
    @UsePipes(new ZodValidationPipe(createSnapshotSchema))
    async createSnapshot(@Param() params: { pageId: string }, @Body() body: CreateSnapshotDto, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.createSnapshot(params.pageId, req.user.id, body.title)
        return { data, success: true }
    }

    @Post(':pageId/snapshots/:snapshotId/restore')
    async restoreSnapshot(@Param() params: { pageId: string; snapshotId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.restoreSnapshot(params.pageId, params.snapshotId, req.user.id)
        return { data, success: true }
    }
}
