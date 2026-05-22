import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { OrgDepartmentEntity, OrgRoleMappingEntity, OrgUserMappingEntity } from '../../../entities/org-entities.entity'
import { UserEntity } from '../../../entities/user.entity'
import { AuditModule } from '../../audit/audit.module'
import { OrgController } from './org.controller'
import { OrgService } from './org.service'

@Module({
    imports: [TypeOrmModule.forFeature([OrgDepartmentEntity, OrgRoleMappingEntity, OrgUserMappingEntity, UserEntity]), AuditModule],
    controllers: [OrgController],
    providers: [OrgService],
})
export class OrgModule {}
