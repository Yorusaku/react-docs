import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CommentEntity } from '../../entities/comment.entity'
import { UserEntity } from '../../entities/user.entity'
import { NotificationModule } from '../notification/notification.module'
import { PageModule } from '../page/page.module'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'

@Module({
    imports: [TypeOrmModule.forFeature([CommentEntity, UserEntity]), PageModule, NotificationModule],
    controllers: [CommentController],
    providers: [CommentService],
})
export class CommentModule {}
