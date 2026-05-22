import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SsoSimulationCodeEntity, SsoSimulationSessionEntity } from '../../../entities/sso-simulation.entity'
import { UserEntity } from '../../../entities/user.entity'
import { AuditModule } from '../../audit/audit.module'
import { SsoController } from './sso.controller'
import { SsoService } from './sso.service'

@Module({
    imports: [TypeOrmModule.forFeature([SsoSimulationCodeEntity, SsoSimulationSessionEntity, UserEntity]), AuditModule],
    controllers: [SsoController],
    providers: [SsoService],
})
export class SsoModule {}
