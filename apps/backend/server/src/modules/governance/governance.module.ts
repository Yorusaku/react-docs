import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GovernanceRetentionPolicyEntity } from '../../../entities/governance-retention-policy.entity'
import { GovernanceController } from './governance.controller'
import { GovernanceService } from './governance.service'

@Module({
    imports: [TypeOrmModule.forFeature([GovernanceRetentionPolicyEntity])],
    controllers: [GovernanceController],
    providers: [GovernanceService],
    exports: [GovernanceService],
})
export class GovernanceModule {}
