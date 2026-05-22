import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserEntity } from '../../entities/user.entity'
import { AuditModule } from '../audit/audit.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), AuditModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
