import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { In, Repository } from 'typeorm'

import { CommentEntity } from '../../entities/comment.entity'
import { UserEntity } from '../../entities/user.entity'
import { NotificationService } from '../notification/notification.service'
import { PageAccessService } from '../page/page-access.service'

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly pageAccessService: PageAccessService,
        private readonly notificationService: NotificationService
    ) {}

    async list(pageId: string, userId: number) {
        await this.pageAccessService.assertAction(pageId, userId, 'read')
        const comments = await this.commentRepository.find({
            where: { page: { pageId } },
            order: { createdAt: 'ASC' },
            relations: ['author', 'parentComment'],
        })
        return comments.map(item => ({
            commentId: item.commentId,
            pageId,
            author: item.author
                ? {
                      id: item.author.id,
                      username: item.author.username,
                  }
                : null,
            parentCommentId: item.parentComment?.commentId ?? null,
            content: item.content,
            anchor: item.anchor,
            resolved: item.resolved,
            hidden: item.hidden,
            mentionUserIds: item.mentionUserIds ?? [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            deletedAt: item.deletedAt,
        }))
    }

    async create(
        pageId: string,
        userId: number,
        payload: {
            content: string
            anchor?: Record<string, unknown> | null
            parentCommentId?: string
            mentionUserIds?: number[]
        }
    ) {
        const { page } = await this.pageAccessService.assertAction(pageId, userId, 'comment')

        let parentComment: CommentEntity | null = null
        if (payload.parentCommentId) {
            parentComment = await this.commentRepository.findOne({
                where: { commentId: payload.parentCommentId, page: { id: page.id } },
            })
            if (!parentComment) {
                throw new NotFoundException('parent comment not found')
            }
        }

        const mentionUserIdsRaw = Array.from(new Set(payload.mentionUserIds ?? []))
        const mentionUsers = mentionUserIdsRaw.length
            ? await this.userRepository.find({
                  where: { id: In(mentionUserIdsRaw) },
              })
            : []

        const author = new UserEntity()
        author.id = userId

        const comment = this.commentRepository.create({
            commentId: 'comment' + nanoid(8),
            page,
            author,
            parentComment,
            content: payload.content.trim(),
            anchor: payload.anchor ?? null,
            mentionUserIds: mentionUsers.map(user => user.id),
            hidden: false,
            resolved: false,
            updatedAt: new Date(),
            deletedAt: null,
        })

        const saved = await this.commentRepository.save(comment)

        await this.notificationService.createMentionNotifications({
            pageId,
            fromUserId: userId,
            commentId: saved.commentId,
            mentionUserIds: saved.mentionUserIds,
            content: saved.content,
        })

        return {
            commentId: saved.commentId,
            content: saved.content,
            mentionUserIds: saved.mentionUserIds,
            createdAt: saved.createdAt,
        }
    }

    async update(
        commentId: string,
        userId: number,
        payload: {
            content?: string
            resolved?: boolean
            hidden?: boolean
        }
    ) {
        const comment = await this.commentRepository.findOne({
            where: { commentId },
            relations: ['author', 'page'],
        })
        if (!comment) {
            throw new NotFoundException('comment not found')
        }

        const access = await this.pageAccessService.assertAction(comment.page.pageId, userId, 'comment')
        const canModerate = this.pageAccessService.canAction(access.member.role, access.member.operations, 'comment_moderate')
        const isAuthor = comment.author?.id === userId
        if (!isAuthor && !canModerate) {
            throw new ForbiddenException('permission denied')
        }

        if (typeof payload.content === 'string') {
            comment.content = payload.content.trim()
        }
        if (typeof payload.resolved === 'boolean') {
            comment.resolved = payload.resolved
        }
        if (typeof payload.hidden === 'boolean' && canModerate) {
            comment.hidden = payload.hidden
        }
        comment.updatedAt = new Date()
        await this.commentRepository.save(comment)
        return {
            commentId: comment.commentId,
            updatedAt: comment.updatedAt,
        }
    }

    async remove(commentId: string, userId: number) {
        const comment = await this.commentRepository.findOne({
            where: { commentId },
            relations: ['author', 'page'],
        })
        if (!comment) {
            throw new NotFoundException('comment not found')
        }

        const access = await this.pageAccessService.assertAction(comment.page.pageId, userId, 'comment')
        const canModerate = this.pageAccessService.canAction(access.member.role, access.member.operations, 'comment_moderate')
        const isAuthor = comment.author?.id === userId
        if (!isAuthor && !canModerate) {
            throw new ForbiddenException('permission denied')
        }

        comment.deletedAt = new Date()
        comment.hidden = true
        comment.updatedAt = new Date()
        await this.commentRepository.save(comment)
        return { commentId }
    }
}
