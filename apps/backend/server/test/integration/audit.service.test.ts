import { join } from 'node:path'

import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { DataSource, Repository } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { UserEntity } from '../../src/entities/user.entity'
// RED: 以下导入路径尚未创建 → 编译失败
import { AuditService } from '../../src/modules/audit/audit.service'

describe('AuditService (RED)', () => {
    let module: TestingModule
    let ds: DataSource
    let auditService: AuditService
    let userRepo: Repository<UserEntity>

    const testDb = process.env.PG_DATABASE_TEST ?? 'miaoma_test'
    const pgHost = process.env.PG_HOST ?? 'localhost'
    const pgPort = Number(process.env.PG_PORT ?? 5432)
    const pgUser = process.env.PG_USER ?? 'postgres'
    const pgPassword = process.env.PG_PASSWORD ?? 'postgres'

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres', host: pgHost, port: pgPort, username: pgUser,
                    password: pgPassword, database: testDb,
                    entities: [join(__dirname, '../../src', '**/**.entity{.ts,.js}')],
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([UserEntity]),
            ],
            providers: [AuditService],
        }).compile()

        ds = module.get(DataSource)
        auditService = module.get(AuditService)
        userRepo = ds.getRepository(UserEntity)
    })

    afterAll(async () => { await module?.close() })

    describe('emit', () => {
        it('记录一条审计事件并返回 eventId', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'a1', password: 'h' }))
            const result = await auditService.emit({
                type: 'login', summary: '用户登录', actorUserId: user.id,
                targetType: 'auth', targetId: String(user.id),
            })
            expect(result.eventId).toBeTruthy()
            expect(result.type).toBe('login')
        })

        it('系统事件允许 actorUserId=null', async () => {
            const result = await auditService.emit({
                type: 'system', summary: '定时任务', actorUserId: null,
                targetType: 'system',
            })
            expect(result.actorUserId).toBeNull()
        })

        it('可选 meta 字段写入 JSON', async () => {
            const result = await auditService.emit({
                type: 'page_create', summary: '创建页面', actorUserId: 1,
                targetType: 'page', targetId: 'p1',
                meta: { ip: '127.0.0.1', ua: 'chrome' },
            })
            expect(result.meta.ip).toBe('127.0.0.1')
        })
    })

    describe('query', () => {
        it('按类型筛选', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'a2', password: 'h' }))
            await auditService.emit({ type: 'login', summary: 'x', actorUserId: user.id, targetType: 'auth' })
            await auditService.emit({ type: 'logout', summary: 'x', actorUserId: user.id, targetType: 'auth' })

            const res = await auditService.query({ type: 'login', limit: 10 })
            expect(res.items.every((e: any) => e.type === 'login')).toBe(true)
        })

        it('分页返回 nextCursor', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'a3', password: 'h' }))
            for (let i = 0; i < 5; i++) {
                await auditService.emit({ type: 'test', summary: `e${i}`, actorUserId: user.id, targetType: 'test' })
            }
            const res = await auditService.query({ limit: 2 })
            expect(res.items.length).toBeLessThanOrEqual(2)
            expect(res.nextCursor).toBeTruthy()
        })

        it('按时间范围 from/to 过滤', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'a4', password: 'h' }))
            const t0 = new Date(Date.now() - 100000).toISOString()
            await auditService.emit({ type: 'test', summary: 'old', actorUserId: user.id, targetType: 't' })
            const t1 = new Date().toISOString()
            await auditService.emit({ type: 'test', summary: 'new', actorUserId: user.id, targetType: 't' })

            const res = await auditService.query({ from: t1, limit: 10 })
            expect(res.items.length).toBeGreaterThanOrEqual(1)
        })
    })

    describe('stats', () => {
        it('统计总事件数', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'a5', password: 'h' }))
            await auditService.emit({ type: 'login', summary: 'x', actorUserId: user.id, targetType: 'auth' })
            await auditService.emit({ type: 'login', summary: 'x', actorUserId: user.id, targetType: 'auth' })
            await auditService.emit({ type: 'page_create', summary: 'x', actorUserId: user.id, targetType: 'page' })

            const stats = await auditService.stats({ days: 7 })
            expect(stats.total).toBeGreaterThanOrEqual(3)
            expect(stats.byType.find((t: any) => t.type === 'login')!.count).toBe(2)
        })

        it('按日期趋势聚合', async () => {
            const stats = await auditService.stats({ days: 7 })
            expect(Array.isArray(stats.trend)).toBe(true)
        })

        it('topActors 最多 5 个', async () => {
            const stats = await auditService.stats({ days: 7 })
            expect(stats.topActors.length).toBeLessThanOrEqual(5)
        })
    })
})
