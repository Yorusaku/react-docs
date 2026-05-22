import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SearchIndexJobEntity } from '../../../entities/search-index-job.entity'
import { PageSearchIndexEntity } from '../../../entities/page-search-index.entity'
import { NotificationEntity } from '../../../entities/notification.entity'
import { AuditEventEntity } from '../../../entities/audit-event.entity'
import { ObservabilityController } from './observability.controller'
import { ObservabilityDashboardService } from './observability-dashboard.service'

@Module({
    imports: [TypeOrmModule.forFeature([SearchIndexJobEntity, PageSearchIndexEntity, NotificationEntity, AuditEventEntity])],
    controllers: [ObservabilityController],
    providers: [ObservabilityDashboardService],
})
export class ObservabilityModule {}
