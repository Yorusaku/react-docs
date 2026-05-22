import { join } from 'node:path'

import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { DataSource, Repository } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { UserEntity } from '../../src/entities/user.entity'
import { ObservabilityDashboardService } from '../../src/modules/observability/observability-dashboard.service'

describe('ObservabilityDashboardService (RED)', () => {
    let module: TestingModule
    let ds: DataSource
    let observabilityService: ObservabilityDashboardService
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
            providers: [ObservabilityDashboardService],
        }).compile()

        ds = module.get(DataSource)
        observabilityService = module.get(ObservabilityDashboardService)
        userRepo = ds.getRepository(UserEntity)
    })

    afterAll(async () => { await module?.close() })

    describe('getDashboard', () => {
        it('mode=real', async () => {
            const dash = await observabilityService.getDashboard()
            expect(dash.mode).toBe('real')
        })

        it('包含 generatedAt ISO 时间戳', async () => {
            const dash = await observabilityService.getDashboard()
            expect(dash.generatedAt).toBeTruthy()
            expect(new Date(dash.generatedAt).getTime()).toBeGreaterThan(0)
        })

        it('包含 windows 配置', async () => {
            const dash = await observabilityService.getDashboard()
            expect(dash.windows.aiRateLimitSeconds).toBeGreaterThan(0)
            expect(dash.windows.auditTrendDays).toBeGreaterThan(0)
        })

        it('包含 definitions', async () => {
            const dash = await observabilityService.getDashboard()
            expect(dash.definitions.collaboration).toBeTruthy()
            expect(dash.definitions.searchIndex).toBeTruthy()
            expect(dash.definitions.aiRateLimit).toBeTruthy()
            expect(dash.definitions.audit).toBeTruthy()
        })

        it('collaboration.currentConnections >= 0', async () => {
            const dash = await observabilityService.getDashboard()
            expect(dash.collaboration.currentConnections).toBeGreaterThanOrEqual(0)
        })

        it('searchIndex 指标', async () => {
            const dash = await observabilityService.getDashboard()
            expect(dash.searchIndex.pendingJobs).toBeGreaterThanOrEqual(0)
            expect(dash.searchIndex.indexedPages).toBeGreaterThanOrEqual(0)
        })

        it('notifications.unreadCount >= 0', async () => {
            const dash = await observabilityService.getDashboard()
            expect(dash.notifications.unreadCount).toBeGreaterThanOrEqual(0)
        })

        it('audit.totalEvents >= 0', async () => {
            const dash = await observabilityService.getDashboard()
            expect(dash.audit.totalEvents).toBeGreaterThanOrEqual(0)
        })
    })
})
