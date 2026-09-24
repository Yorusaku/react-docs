import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
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
    async create(@Body(new ZodValidationPipe(createPageSchema)) body: CreatePageDto, @Request() req: { user: { id: number } }) {
        const user = new UserEntity()
        user.id = req.user.id

        const page = new PageEntity(body)
        page.pageId = 'page' + nanoid(6)

        const created = await this.pageService.create({ ...page, user }, req.user.id)
        return { data: created, success: true }
    }

    @Put()
    async update(@Body(new ZodValidationPipe(updatePageSchema)) body: UpdatePageDto, @Request() req: { user: { id: number } }) {
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
    async delete(@Body(new ZodValidationPipe(deletePageSchema)) body: DeletePageDto, @Request() req: { user: { id: number } }) {
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

    @Get(':pageId/access')
    async getAccess(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.getAccess(params.pageId, req.user.id)
        return { data, success: true }
    }

    @Put(':pageId/acl')
    async updateAcl(
        @Param() params: { pageId: string },
        @Body(new ZodValidationPipe(updateAclSchema)) body: UpdateAclDto,
        @Request() req: { user: { id: number } }
    ) {
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
    async inviteMember(
        @Param() params: { pageId: string },
        @Body(new ZodValidationPipe(inviteMemberSchema)) body: InviteMemberDto,
        @Request() req: { user: { id: number } }
    ) {
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
    async updatePageTags(
        @Param() params: { pageId: string },
        @Body(new ZodValidationPipe(updatePageTagsSchema)) body: UpdatePageTagsDto,
        @Request() req: { user: { id: number } }
    ) {
        const data = await this.pageService.updatePageTags(params.pageId, req.user.id, body.tags)
        return { data, success: true }
    }

    @Get(':pageId/snapshots')
    async listSnapshots(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        await this.pageService.fetch({ pageId: params.pageId, userId: req.user.id })
        const data = await this.pageService.listSnapshots(params.pageId)
        return { data, success: true }
    }

    @Post(':pageId/snapshots')
    async createSnapshot(
        @Param() params: { pageId: string },
        @Body(new ZodValidationPipe(createSnapshotSchema)) body: CreateSnapshotDto,
        @Request() req: { user: { id: number } }
    ) {
        const data = await this.pageService.createSnapshot({ pageId: params.pageId, userId: req.user.id, title: body.title })
        return { data, success: true }
    }

    @Post(':pageId/snapshots/:snapshotId/restore')
    async restoreSnapshot(@Param() params: { pageId: string; snapshotId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.pageService.restoreSnapshot({ pageId: params.pageId, snapshotId: params.snapshotId, userId: req.user.id })
        return { data, success: true }
    }
}
