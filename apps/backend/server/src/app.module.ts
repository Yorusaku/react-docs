import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'

import databaseConfig from './config/database'
import { TasksModule } from './fundamentals/tasks/tasks.module'
import { YjsPostgresqlModule } from './fundamentals/yjs-postgresql/yjs-postgresql.module'
import { AiModule } from './modules/ai/ai.module'
import { ApplicationModule } from './modules/application/application.module'
import { AuthModule } from './modules/auth/auth.module'
import { CommentModule } from './modules/comment/comment.module'
import { DocYjsModule } from './modules/doc-yjs/doc-yjs.module'
import { NotificationModule } from './modules/notification/notification.module'
import { PageModule } from './modules/page/page.module'
import { SearchModule } from './modules/search/search.module'
import { TagModule } from './modules/tag/tag.module'
import { TemplateModule } from './modules/template/template.module'
import { UserModule } from './modules/user/user.module'

@Module({
    imports: [
        ConfigModule.forRoot({ load: [databaseConfig] }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => config.get('database'),
            inject: [ConfigService],
        }),
        AuthModule,
        UserModule,
        ApplicationModule,
        DocYjsModule,
        PageModule,
        TagModule,
        TemplateModule,
        SearchModule,
        NotificationModule,
        CommentModule,
        AiModule,
        TasksModule,
        YjsPostgresqlModule.forRoot(),
    ],
})
export class AppModule {}
