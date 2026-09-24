import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AuditEventEntity } from '../../src/entities/audit-event.entity'
import { NotificationEntity } from '../../src/entities/notification.entity'
import { PageSearchIndexEntity } from '../../src/entities/page-search-index.entity'
import { SearchIndexJobEntity } from '../../src/entities/search-index-job.entity'
import { ObservabilityDashboardService } from '../../src/modules/observability/observability-dashboard.service'
import { integrationTypeOrmOptions, resetIntegrationTables } from './support/test-database'

describe('ObservabilityDashboardService Integration', () => {
    let module: TestingModule
    let observabilityService: ObservabilityDashboardService

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot(integrationTypeOrmOptions()),
                TypeOrmModule.forFeature([SearchIndexJobEntity, PageSearchIndexEntity, NotificationEntity, AuditEventEntity]),
            ],
            providers: [ObservabilityDashboardService],
        }).compile()

        observabilityService = module.get(ObservabilityDashboardService)
        await resetIntegrationTables(module.get(DataSource), ['search_index_job', 'page_search_index', 'notification', 'audit_event'])
    })

    afterAll(async () => {
        await module?.close()
    })

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
