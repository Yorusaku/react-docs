import { join } from 'node:path'

import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { DataSource, Repository } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { PageEntity } from '../../src/entities/page.entity'
import { PageMemberEntity } from '../../src/entities/page-member.entity'
import { PageSearchIndexEntity } from '../../src/entities/page-search-index.entity'
import { PageSnapshotEntity } from '../../src/entities/page-snapshot.entity'
import { PageTagEntity } from '../../src/entities/page-tag.entity'
import { SearchIndexJobEntity } from '../../src/entities/search-index-job.entity'
import { TagEntity } from '../../src/entities/tag.entity'
import { UserEntity } from '../../src/entities/user.entity'
import { PageService } from '../../src/modules/page/page.service'
import { PageAccessService } from '../../src/modules/page/page-access.service'

describe('PageService Integration', () => {
    let module: TestingModule
    let ds: DataSource
    let pageService: PageService
    let userRepo: Repository<UserEntity>
    let pageRepo: Repository<PageEntity>
    let memberRepo: Repository<PageMemberEntity>
    let searchJobRepo: Repository<SearchIndexJobEntity>

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
                    PageEntity,
                    PageMemberEntity,
                    PageSnapshotEntity,
                    TagEntity,
                    PageTagEntity,
                    SearchIndexJobEntity,
                    PageSearchIndexEntity,
                ]),
            ],
            providers: [PageService, PageAccessService, { provide: 'YJS_POSTGRESQL_ADAPTER', useValue: mockYjsAdapter }],
        }).compile()

        ds = module.get(DataSource)
        pageService = module.get(PageService)
        userRepo = ds.getRepository(UserEntity)
        pageRepo = ds.getRepository(PageEntity)
        memberRepo = ds.getRepository(PageMemberEntity)
        searchJobRepo = ds.getRepository(SearchIndexJobEntity)
    })

    afterAll(async () => {
        await module?.close()
    })

    describe('create', () => {
        it('should create page with owner member and search index job', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'u-p1', password: 'hash' }))
            const pageEntity = new PageEntity({
                pageId: 'page' + nanoid(8),
                title: 'My Doc',
                emoji: 'doc',
            })
            const saved = await pageService.create(pageEntity, user.id)

            expect(saved.pageId).toBeTruthy()
            expect(saved.title).toBe('My Doc')
            expect(saved.deletedAt).toBeNull()

            const member = await memberRepo.findOne({
                where: { page: { id: saved.id }, user: { id: user.id } },
            })
            expect(member).toBeTruthy()
            expect(member!.role).toBe('owner')

            const job = await searchJobRepo.findOne({ where: { page: { id: saved.id } } })
            expect(job).toBeTruthy()
        })

        it('should sanitize title: strip control chars, trim, cut at 255', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'u-p2', password: 'hash' }))
            const longTitle = 'A'.repeat(300) + String.fromCharCode(0, 1) + 'B'
            const pageEntity = new PageEntity({
                pageId: 'page' + nanoid(8),
                title: longTitle,
                emoji: 'file',
            })
            const saved = await pageService.create(pageEntity, user.id)

            expect(saved.title.length).toBeLessThanOrEqual(255)
            expect(saved.title).not.toContain(String.fromCharCode(0))
            expect(saved.title).not.toContain(String.fromCharCode(1))
        })
    })

    describe('softDelete and restore', () => {
        it('should soft-delete page', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'u-sd1', password: 'hash' }))
            const pageEntity = new PageEntity({ pageId: 'page' + nanoid(8), title: 'To Delete', emoji: 'trash' })
            const saved = await pageService.create(pageEntity, user.id)

            await pageService.softDelete({ pageId: saved.pageId, userId: user.id })

            const page = await pageRepo.findOne({ where: { pageId: saved.pageId } })
            expect(page!.deletedAt).toBeTruthy()
        })

        it('should restore page and clear deletedAt', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'u-sd2', password: 'hash' }))
            const pageEntity = new PageEntity({ pageId: 'page' + nanoid(8), title: 'To Restore', emoji: 'refresh' })
            const saved = await pageService.create(pageEntity, user.id)
            await pageService.softDelete({ pageId: saved.pageId, userId: user.id })

            await pageService.restore({ pageId: saved.pageId, userId: user.id })

            const page = await pageRepo.findOne({ where: { pageId: saved.pageId } })
            expect(page!.deletedAt).toBeNull()

            const job = await searchJobRepo.findOne({ where: { page: { id: saved.id }, reason: 'page_restored' } })
            expect(job).toBeTruthy()
        })
    })

    describe('list', () => {
        it('should return pages accessible by user', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'u-list1', password: 'hash' }))
            const pageEntity = new PageEntity({ pageId: 'page' + nanoid(8), title: 'My Page', emoji: 'page' })
            const saved = await pageService.create(pageEntity, user.id)

            const result = await pageService.list({ userId: user.id })

            const found = result.pages.find((p: PageEntity) => p.pageId === saved.pageId)
            expect(found).toBeTruthy()
            expect(found!.title).toBe('My Page')
        })

        it('should not include deleted pages', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'u-list2', password: 'hash' }))
            const pageEntity = new PageEntity({ pageId: 'page' + nanoid(8), title: 'Deleted Page', emoji: 'trash' })
            const saved = await pageService.create(pageEntity, user.id)
            await pageService.softDelete({ pageId: saved.pageId, userId: user.id })

            const result = await pageService.list({ userId: user.id })

            const found = result.pages.find((p: PageEntity) => p.pageId === saved.pageId)
            expect(found).toBeUndefined()
        })
    })

    describe('update', () => {
        it('should update title and enqueue search index', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'u-upd1', password: 'hash' }))
            const pageEntity = new PageEntity({ pageId: 'page' + nanoid(8), title: 'Old Title', emoji: 'edit' })
            const saved = await pageService.create(pageEntity, user.id)

            await pageService.update({ pageId: saved.pageId, title: 'New Title', userId: user.id })

            const updated = await pageRepo.findOne({ where: { pageId: saved.pageId } })
            expect(updated!.title).toBe('New Title')

            const job = await searchJobRepo.findOne({ where: { page: { id: saved.id }, reason: 'title_updated' } })
            expect(job).toBeTruthy()
        })
    })
})
