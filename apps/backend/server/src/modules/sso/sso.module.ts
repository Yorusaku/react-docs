import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SsoSimulationCodeEntity, SsoSimulationSessionEntity } from '../../entities/sso-simulation.entity'
import { UserEntity } from '../../entities/user.entity'
import { AuditModule } from '../audit/audit.module'
import { jwtConstants } from '../auth/constants'
import { SsoController } from './sso.controller'
import { SsoService } from './sso.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([SsoSimulationCodeEntity, SsoSimulationSessionEntity, UserEntity]),
        AuditModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1 days' },
        }),
    ],
    controllers: [SsoController],
    providers: [SsoService],
})
export class SsoModule {}
