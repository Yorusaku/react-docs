import { Module } from '@nestjs/common'

import { AuditModule } from '../../modules/audit/audit.module'
import { GovernanceModule } from '../../modules/governance/governance.module'
import { PageModule } from '../../modules/page/page.module'
import { TasksService } from './tasks.service'

@Module({
    imports: [PageModule, GovernanceModule, AuditModule],
    providers: [TasksService],
})
export class TasksModule {}
