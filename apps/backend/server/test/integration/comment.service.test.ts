import { join } from 'node:path'

import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { DataSource, Repository } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { CommentEntity } from '../../src/entities/comment.entity'
import { NotificationEntity } from '../../src/entities/notification.entity'
import { PageEntity } from '../../src/entities/page.entity'
import { PageMemberEntity } from '../../src/entities/page-member.entity'
import { PageSearchIndexEntity } from '../../src/entities/page-search-index.entity'
import { PageSnapshotEntity } from '../../src/entities/page-snapshot.entity'
import { PageTagEntity } from '../../src/entities/page-tag.entity'
import { SearchIndexJobEntity } from '../../src/entities/search-index-job.entity'
import { TagEntity } from '../../src/entities/tag.entity'
import { UserEntity } from '../../src/entities/user.entity'
import { CommentService } from '../../src/modules/comment/comment.service'
import { NotificationService } from '../../src/modules/notification/notification.service'
import { PageService } from '../../src/modules/page/page.service'
import { PageAccessService } from '../../src/modules/page/page-access.service'

describe('CommentService Integration', () => {
    let module: TestingModule
    let ds: DataSource
    let commentService: CommentService
    let pageService: PageService
    let userRepo: Repository<UserEntity>
    let commentRepo: Repository<CommentEntity>
    let notificationRepo: Repository<NotificationEntity>

    const mockYjsAdapter = {
        getYDoc: async () => ({ getXmlFragment: () => ({ toJSON: () => '' }) }),
        clearDocument: async () => {},
        setDocumentUpdate: async () => {},
    }

    const testDb = process.env.PG_DATABASE_TEST ?? 'miaoma_test'
    const pgHost = process.env.PG_HOST ?? 'localhost'
    const pgPort = Number(process.env.PG_PORT ?? 5432)
    const pgUser = process.env.PG_USER ?? 'postgres'
    const pgPassword = process.env.PG_PASSWORD ?? 'postgres'

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: pgHost,
                    port: pgPort,
                    username: pgUser,
                    password: pgPassword,
                    database: testDb,
                    entities: [join(__dirname, '../../src', '**/**.entity{.ts,.js}')],
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([
                    CommentEntity,
                    UserEntity,
                    PageEntity,
                    PageMemberEntity,
                    PageSnapshotEntity,
                    TagEntity,
                    PageTagEntity,
                    SearchIndexJobEntity,
                    PageSearchIndexEntity,
                    NotificationEntity,
                ]),
            ],
            providers: [
                CommentService,
                PageService,
                PageAccessService,
                NotificationService,
                { provide: 'YJS_POSTGRESQL_ADAPTER', useValue: mockYjsAdapter },
            ],
        }).compile()

        ds = module.get(DataSource)
        commentService = module.get(CommentService)
        pageService = module.get(PageService)
        userRepo = ds.getRepository(UserEntity)
        commentRepo = ds.getRepository(CommentEntity)
        notificationRepo = ds.getRepository(NotificationEntity)
    })

    afterAll(async () => {
        await module?.close()
    })

    async function createTestPage(userId: number, title: string) {
        const pageEntity = new PageEntity({
            pageId: 'page' + nanoid(8),
            title,
            emoji: 'file',
        })
        return pageService.create(pageEntity, userId)
    }

    describe('create', () => {
        it('should create a top-level comment', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'cu-cmt1', password: 'hash' }))
            const page = await createTestPage(user.id, 'Test Page')

            const result = await commentService.create(page.pageId, user.id, { content: 'Hello world!' })

            expect(result.commentId).toBeTruthy()
            expect(result.content).toBe('Hello world!')

            const comment = await commentRepo.findOne({ where: { commentId: result.commentId } })
            expect(comment).toBeTruthy()
            expect(comment!.resolved).toBe(false)
            expect(comment!.hidden).toBe(false)
            expect(comment!.deletedAt).toBeNull()
        })

        it('should create a reply comment with correct parent', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'cu-reply1', password: 'hash' }))
            const page = await createTestPage(user.id, 'Reply Page')
            const parent = await commentService.create(page.pageId, user.id, { content: 'Parent' })

            const reply = await commentService.create(page.pageId, user.id, {
                content: 'Reply',
                parentCommentId: parent.commentId,
            })

            const saved = await commentRepo.findOne({
                where: { commentId: reply.commentId },
                relations: ['parentComment'],
            })
            expect(saved!.parentComment!.commentId).toBe(parent.commentId)
        })

        it('should trigger mention notification', async () => {
            const author = await userRepo.save(userRepo.create({ username: 'cu-noti1', password: 'hash' }))
            const mentioned = await userRepo.save(userRepo.create({ username: 'cu-noti2', password: 'hash' }))
            const page = await createTestPage(author.id, 'Notify Page')

            await commentService.create(page.pageId, author.id, {
                content: 'Hey @cu-noti2 check this',
                mentionUserIds: [mentioned.id],
            })

            const notifs = await notificationRepo.find({ where: { user: { id: mentioned.id } } })
            expect(notifs.length).toBeGreaterThanOrEqual(1)
            expect(notifs[0].type).toBe('comment_mention')
        })
    })

    describe('list', () => {
        it('should list comments for a page', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'cu-list1', password: 'hash' }))
            const page = await createTestPage(user.id, 'List Page')
            await commentService.create(page.pageId, user.id, { content: 'Comment 1' })
            await commentService.create(page.pageId, user.id, { content: 'Comment 2' })

            const comments = await commentService.list(page.pageId, user.id)
            expect(comments.length).toBe(2)
        })
    })

    describe('update', () => {
        it('should mark comment as resolved', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'cu-res1', password: 'hash' }))
            const page = await createTestPage(user.id, 'Resolve Page')
            const { commentId } = await commentService.create(page.pageId, user.id, { content: 'Bug report' })

            await commentService.update(commentId, user.id, { resolved: true })

            const updated = await commentRepo.findOne({ where: { commentId } })
            expect(updated!.resolved).toBe(true)
        })
    })

    describe('remove', () => {
        it('should soft-delete comment', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'cu-del1', password: 'hash' }))
            const page = await createTestPage(user.id, 'Del Page')
            const { commentId } = await commentService.create(page.pageId, user.id, { content: 'To delete' })

            await commentService.remove(commentId, user.id)

            const deleted = await commentRepo.findOne({ where: { commentId } })
            expect(deleted!.deletedAt).toBeTruthy()
            expect(deleted!.hidden).toBe(true)
        })
    })
})
