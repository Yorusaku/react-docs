import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { AuditService } from '../../modules/audit/audit.service'
import { GovernanceService } from '../../modules/governance/governance.service'
import { PageService } from '../../modules/page/page.service'

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name)

    constructor(
        private readonly pageService: PageService,
        private readonly governanceService: GovernanceService,
        private readonly auditService: AuditService,
    ) {}

    @Cron('*/30 * * * * *')
    async processSearchIndexJobs() {
        try {
            const result = await this.pageService.processPendingSearchJobs(50)
            if (result.processed > 0) {
                this.logger.log(`[search-index] processed ${result.processed} jobs`)
            }
        } catch (error) {
            this.logger.error(`[search-index] failed: ${(error as Error).message}`)
        }
    }

    @Cron('0 0 3 * * *')
    async cleanupExpiredData() {
        try {
            const policy = await this.governanceService.getRetentionPolicy()
            await this.pageService.cleanupExpiredData(policy.snapshotDays, policy.trashDays)
            await this.auditService.cleanupExpired(policy.auditDays)
            this.logger.log(`[cleanup] expired data cleaned (snapshot=${policy.snapshotDays}d trash=${policy.trashDays}d audit=${policy.auditDays}d)`)
        } catch (error) {
            this.logger.error(`[cleanup] failed: ${(error as Error).message}`)
        }
    }
}
