import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { NotificationEntity } from '../../entities/notification.entity'
import { AuditModule } from '../audit/audit.module'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
    imports: [TypeOrmModule.forFeature([NotificationEntity]), AuditModule],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
