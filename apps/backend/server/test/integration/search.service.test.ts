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

describe('Search Index Integration', () => {
    let module: TestingModule
    let ds: DataSource
    let pageService: PageService
    let userRepo: Repository<UserEntity>
    let searchJobRepo: Repository<SearchIndexJobEntity>
    let searchIndexRepo: Repository<PageSearchIndexEntity>

    const mockYjsAdapter = {
        getYDoc: async () => ({
            getXmlFragment: () => ({ toJSON: () => '<doc><p>hello world</p></doc>' }),
        }),
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
        searchJobRepo = ds.getRepository(SearchIndexJobEntity)
        searchIndexRepo = ds.getRepository(PageSearchIndexEntity)
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

    describe('search indexing', () => {
        it('should create search index job on page creation', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'si-job1', password: 'hash' }))
            const saved = await createTestPage(user.id, 'Searchable Doc')

            const job = await searchJobRepo.findOne({ where: { page: { id: saved.id } } })
            expect(job).toBeTruthy()
            expect(job!.processedAt).toBeNull()
        })

        it('should process pending search jobs and populate search index', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'si-proc1', password: 'hash' }))
            const saved = await createTestPage(user.id, 'Process Me')

            const result = await pageService.processPendingSearchJobs(50)
            expect(result.processed).toBeGreaterThanOrEqual(1)

            const idx = await searchIndexRepo.findOne({ where: { page: { id: saved.id } } })
            expect(idx).toBeTruthy()
            expect(idx!.title).toBe('Process Me')
            expect(idx!.bodyText).toContain('hello world')
        })
    })

    describe('search pages', () => {
        it('should find page by title text search', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'si-srch1', password: 'hash' }))
            const saved = await createTestPage(user.id, 'Meeting Notes 2026')
            await pageService.processPendingSearchJobs(50)

            const result = await pageService.searchPages({ userId: user.id, q: 'Meeting' })
            expect(result.items.length).toBeGreaterThanOrEqual(1)
            expect(result.items.some((i: { pageId: string }) => i.pageId === saved.pageId)).toBe(true)
        })

        it('should return empty when no match', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'si-srch2', password: 'hash' }))
            await createTestPage(user.id, 'Random Doc')
            await pageService.processPendingSearchJobs(50)

            const result = await pageService.searchPages({ userId: user.id, q: 'NONEXISTENT_QUERY_XXXXX' })
            expect(result.items.length).toBe(0)
        })

        it('should only return pages the user is a member of', async () => {
            const userA = await userRepo.save(userRepo.create({ username: 'si-perm1', password: 'hash' }))
            const userB = await userRepo.save(userRepo.create({ username: 'si-perm2', password: 'hash' }))
            const pageA = await createTestPage(userA.id, 'User A Doc')
            await createTestPage(userB.id, 'User B Doc')
            await pageService.processPendingSearchJobs(50)

            const resultA = await pageService.searchPages({ userId: userA.id, q: 'User' })
            const pageIdsA = resultA.items.map((i: { pageId: string }) => i.pageId)
            expect(pageIdsA).toContain(pageA.pageId)
            const bVisible = resultA.items.some((r: { pageId: string; title: string }) => r.title === 'User B Doc')
            expect(bVisible).toBe(false)
        })
    })
})
