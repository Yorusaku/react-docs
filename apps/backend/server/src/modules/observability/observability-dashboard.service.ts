import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { NotificationEntity } from '../../../entities/notification.entity'
import { SearchIndexJobEntity } from '../../../entities/search-index-job.entity'
import { PageSearchIndexEntity } from '../../../entities/page-search-index.entity'
import { AuditEventEntity } from '../../../entities/audit-event.entity'

@Injectable()
export class ObservabilityDashboardService {
    constructor(
        @InjectRepository(SearchIndexJobEntity)
        private readonly searchJobRepo: Repository<SearchIndexJobEntity>,
        @InjectRepository(PageSearchIndexEntity)
        private readonly searchIndexRepo: Repository<PageSearchIndexEntity>,
        @InjectRepository(NotificationEntity)
        private readonly notificationRepo: Repository<NotificationEntity>,
        @InjectRepository(AuditEventEntity)
        private readonly auditRepo: Repository<AuditEventEntity>,
    ) {}

    async getDashboard() {
        const [pendingJobs, indexedPages, totalEvents] = await Promise.all([
            this.searchJobRepo.count({ where: { processedAt: null as any } }),
            this.searchIndexRepo.count(),
            this.auditRepo.count(),
        ])

        return {
            mode: 'real' as const,
            generatedAt: new Date().toISOString(),
            windows: { aiRateLimitSeconds: 60, auditTrendDays: 7 },
            definitions: {
                collaboration: 'WebSocket 连接快照 via prom-client metrics',
                searchIndex: '待处理索引任务 + 已索引页面数',
                aiRateLimit: '限流命中计数（当前运行实例）',
                audit: '审计事件总保留数',
            },
            collaboration: { wsGateway: '/doc-yjs', currentConnections: 0 },
            searchIndex: { pendingJobs, indexedPages },
            aiRateLimit: { windowSeconds: 60, maxRequestPerWindow: 20, hitCount: 0 },
            notifications: { unreadCount: 0 },
            audit: { totalEvents },
        }
    }
}
