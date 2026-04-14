import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { PageService } from '../../modules/page/page.service'

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name)

    constructor(private readonly pageService: PageService) {}

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
            await this.pageService.cleanupExpiredData()
            this.logger.log('[cleanup] expired snapshots/pages cleaned')
        } catch (error) {
            this.logger.error(`[cleanup] failed: ${(error as Error).message}`)
        }
    }
}
