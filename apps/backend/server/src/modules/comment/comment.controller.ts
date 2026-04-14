import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards, UsePipes } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { CreateCommentDto, createCommentSchema, UpdateCommentDto, updateCommentSchema } from './comment.dto'
import { CommentService } from './comment.service'

@Controller()
@UseGuards(AuthGuard('jwt'))
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Get('page/:pageId/comments')
    async list(@Param() params: { pageId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.commentService.list(params.pageId, req.user.id)
        return { data, success: true }
    }

    @Post('page/:pageId/comments')
    @UsePipes(new ZodValidationPipe(createCommentSchema))
    async create(@Param() params: { pageId: string }, @Body() body: CreateCommentDto, @Request() req: { user: { id: number } }) {
        const data = await this.commentService.create(params.pageId, req.user.id, {
            content: body.content ?? '',
            anchor: body.anchor ?? null,
            parentCommentId: body.parentCommentId,
            mentionUserIds: body.mentionUserIds ?? [],
        })
        return { data, success: true }
    }

    @Patch('comments/:commentId')
    @UsePipes(new ZodValidationPipe(updateCommentSchema))
    async update(@Param() params: { commentId: string }, @Body() body: UpdateCommentDto, @Request() req: { user: { id: number } }) {
        const data = await this.commentService.update(params.commentId, req.user.id, body)
        return { data, success: true }
    }

    @Delete('comments/:commentId')
    async remove(@Param() params: { commentId: string }, @Request() req: { user: { id: number } }) {
        const data = await this.commentService.remove(params.commentId, req.user.id)
        return { data, success: true }
    }
}
