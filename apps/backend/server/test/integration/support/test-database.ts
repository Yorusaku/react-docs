import type { TypeOrmModuleOptions } from '@nestjs/typeorm'
import type { DataSource } from 'typeorm'

import { ApplicationEntity } from '../../../src/entities/application.entity'
import { AuditEventEntity } from '../../../src/entities/audit-event.entity'
import { CommentEntity } from '../../../src/entities/comment.entity'
import { GovernanceRetentionPolicyEntity } from '../../../src/entities/governance-retention-policy.entity'
import { NotificationEntity } from '../../../src/entities/notification.entity'
import { OrgDepartmentEntity, OrgRoleMappingEntity, OrgUserMappingEntity } from '../../../src/entities/org-entities.entity'
import { PageEntity } from '../../../src/entities/page.entity'
import { PageMemberEntity } from '../../../src/entities/page-member.entity'
import { PageSearchIndexEntity } from '../../../src/entities/page-search-index.entity'
import { PageSnapshotEntity } from '../../../src/entities/page-snapshot.entity'
import { PageTagEntity } from '../../../src/entities/page-tag.entity'
import { SearchIndexJobEntity } from '../../../src/entities/search-index-job.entity'
import { SsoSimulationCodeEntity, SsoSimulationSessionEntity } from '../../../src/entities/sso-simulation.entity'
import { TagEntity } from '../../../src/entities/tag.entity'
import { TemplateEntity } from '../../../src/entities/template.entity'
import { UserEntity } from '../../../src/entities/user.entity'

/**
 * 显式登记全部实体类，替换原先按目录 glob 扫描 entity 文件的写法。
 * glob 会让 TypeORM 在 Vitest 下直接 require 到 .ts 文件，触发 SyntaxError。
 */
export const INTEGRATION_ENTITIES = [
    ApplicationEntity,
    AuditEventEntity,
    CommentEntity,
    GovernanceRetentionPolicyEntity,
    NotificationEntity,
    OrgDepartmentEntity,
    OrgRoleMappingEntity,
    OrgUserMappingEntity,
    PageEntity,
    PageMemberEntity,
    PageSearchIndexEntity,
    PageSnapshotEntity,
    PageTagEntity,
    SearchIndexJobEntity,
    SsoSimulationCodeEntity,
    SsoSimulationSessionEntity,
    TagEntity,
    TemplateEntity,
    UserEntity,
]

/** 集成测试只会指向以后缀 `_test` 结尾的独立测试库。 */
export function assertSafeIntegrationDatabase(database: string): void {
    if (!/_test$/.test(database)) {
        throw new Error(
            `Refusing to run integration tests against "${database}". ` +
                'Set PG_DATABASE_TEST to a dedicated database whose name ends with "_test".'
        )
    }
}

/** 统一读取 PG 环境变量；数据库名必须在连接前通过安全断言。 */
export function integrationTypeOrmOptions(): TypeOrmModuleOptions {
    const database = process.env.PG_DATABASE_TEST ?? 'miaoma_test'
    assertSafeIntegrationDatabase(database)

    return {
        type: 'postgres',
        host: process.env.PG_HOST ?? 'localhost',
        port: Number(process.env.PG_PORT ?? 5432),
        username: process.env.PG_USER ?? 'postgres',
        password: process.env.PG_PASSWORD ?? 'postgres',
        database,
        entities: INTEGRATION_ENTITIES,
        synchronize: true,
    }
}

/** 清空指定表并重置自增序列；集成测试文件串行执行，因此清理是确定性的。 */
export async function resetIntegrationTables(ds: DataSource, tables: string[]): Promise<void> {
    if (tables.length === 0) return
    const quoted = tables.map(table => `"${table}"`).join(', ')
    await ds.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`)
}
