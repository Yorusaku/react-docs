import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'

import databaseConfig from './config/database'
import { HealthModule } from './fundamentals/observability/health.module'
import { MetricsModule } from './fundamentals/observability/metrics.module'
import { TasksModule } from './fundamentals/tasks/tasks.module'
import { YjsPostgresqlModule } from './fundamentals/yjs-postgresql/yjs-postgresql.module'
import { AiModule } from './modules/ai/ai.module'
import { ApplicationModule } from './modules/application/application.module'
import { AuditModule } from './modules/audit/audit.module'
import { AuthModule } from './modules/auth/auth.module'
import { CommentModule } from './modules/comment/comment.module'
import { DocYjsModule } from './modules/doc-yjs/doc-yjs.module'
import { GovernanceModule } from './modules/governance/governance.module'
import { NotificationModule } from './modules/notification/notification.module'
import { ObservabilityModule } from './modules/observability/observability.module'
import { OrgModule } from './modules/org/org.module'
import { PageModule } from './modules/page/page.module'
import { SearchModule } from './modules/search/search.module'
import { SsoModule } from './modules/sso/sso.module'
import { TagModule } from './modules/tag/tag.module'
import { TemplateModule } from './modules/template/template.module'
import { UserModule } from './modules/user/user.module'

@Module({
    imports: [
        ConfigModule.forRoot({ load: [databaseConfig] }),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
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
        AuditModule,
        GovernanceModule,
        ObservabilityModule,
        SsoModule,
        OrgModule,
        TasksModule,
        YjsPostgresqlModule.forRoot(),
        HealthModule,
        MetricsModule,
    ],
})
export class AppModule {}
