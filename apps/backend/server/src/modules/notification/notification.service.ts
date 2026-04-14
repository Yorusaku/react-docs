import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { Repository } from 'typeorm'

import { NotificationEntity } from '../../entities/notification.entity'
import { UserEntity } from '../../entities/user.entity'

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>
    ) {}

    async list(userId: number) {
        const rows = await this.notificationRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            take: 100,
        })
        const unreadCount = await this.notificationRepository.count({
            where: { user: { id: userId }, readAt: null },
        })

        return {
            unreadCount,
            items: rows,
        }
    }

    async markRead(notificationId: string, userId: number) {
        const row = await this.notificationRepository.findOne({
            where: { notificationId, user: { id: userId } },
        })
        if (!row) {
            return { notificationId, success: false }
        }
        row.readAt = row.readAt ?? new Date()
        await this.notificationRepository.save(row)
        return { notificationId, success: true }
    }

    async markAllRead(userId: number) {
        await this.notificationRepository
            .createQueryBuilder()
            .update(NotificationEntity)
            .set({ readAt: new Date() })
            .where('"userId" = :userId', { userId })
            .andWhere('"readAt" IS NULL')
            .execute()

        return { success: true }
    }

    async createMentionNotifications(payload: {
        pageId: string
        fromUserId: number
        commentId: string
        mentionUserIds: number[]
        content: string
    }) {
        const mentionUserIds = Array.from(new Set(payload.mentionUserIds)).filter(id => id !== payload.fromUserId)
        if (mentionUserIds.length === 0) {
            return
        }

        const rows = mentionUserIds.map(userId => {
            const user = new UserEntity()
            user.id = userId

            return this.notificationRepository.create({
                notificationId: 'notice' + nanoid(8),
                user,
                type: 'comment_mention',
                title: '你被提及了',
                content: payload.content.slice(0, 300),
                payload: {
                    pageId: payload.pageId,
                    commentId: payload.commentId,
                    fromUserId: payload.fromUserId,
                },
            })
        })

        await this.notificationRepository.save(rows)
    }
}
