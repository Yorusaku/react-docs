import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class P1GovernanceAudit1747920000000 implements MigrationInterface {
    name = 'P1GovernanceAudit1747920000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'audit_event',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'eventId', type: 'varchar', length: '80', isUnique: true },
                { name: 'type', type: 'varchar', length: '100' },
                { name: 'actorUserId', type: 'integer', isNullable: true },
                { name: 'targetType', type: 'varchar', length: '100' },
                { name: 'targetId', type: 'varchar', length: '255', isNullable: true },
                { name: 'summary', type: 'varchar', length: '500' },
                { name: 'meta', type: 'jsonb', default: "'{}'" },
                { name: 'createdAt', type: 'timestamp', default: 'now()' },
            ],
        }))

        await queryRunner.createTable(new Table({
            name: 'governance_retention_policy',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'snapshotDays', type: 'integer', default: '30' },
                { name: 'trashDays', type: 'integer', default: '30' },
                { name: 'auditDays', type: 'integer', default: '90' },
                { name: 'updatedAt', type: 'timestamp', default: 'now()' },
            ],
        }))

        await queryRunner.createTable(new Table({
            name: 'sso_simulation_code',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'code', type: 'varchar', length: '128', isUnique: true },
                { name: 'provider', type: 'varchar', length: '50' },
                { name: 'simulatedUserId', type: 'varchar', length: '255' },
                { name: 'expiresAt', type: 'timestamp' },
                { name: 'used', type: 'boolean', default: 'false' },
                { name: 'createdAt', type: 'timestamp', default: 'now()' },
            ],
        }))

        await queryRunner.createTable(new Table({
            name: 'sso_simulation_session',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'sessionId', type: 'varchar', length: '128' },
                { name: 'userId', type: 'integer' },
                { name: 'provider', type: 'varchar', length: '50' },
                { name: 'expiresAt', type: 'timestamp' },
                { name: 'createdAt', type: 'timestamp', default: 'now()' },
            ],
        }))

        await queryRunner.createTable(new Table({
            name: 'org_department',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'departmentId', type: 'varchar', length: '80' },
                { name: 'name', type: 'varchar', length: '255' },
                { name: 'createdAt', type: 'timestamp', default: 'now()' },
            ],
        }))

        await queryRunner.createTable(new Table({
            name: 'org_role_mapping',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'position', type: 'varchar', length: '100', isUnique: true },
                { name: 'defaultRole', type: 'varchar', length: '50', default: "'viewer'" },
                { name: 'updatedAt', type: 'timestamp', default: 'now()' },
            ],
        }))

        await queryRunner.createTable(new Table({
            name: 'org_user_mapping',
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'userId', type: 'integer', isUnique: true },
                { name: 'username', type: 'varchar', length: '255' },
                { name: 'departmentId', type: 'varchar', length: '80', isNullable: true },
                { name: 'position', type: 'varchar', length: '100', isNullable: true },
                { name: 'defaultRole', type: 'varchar', length: '50', default: "'viewer'" },
                { name: 'updatedAt', type: 'timestamp', default: 'now()' },
            ],
        }))

        // 创建索引
        await queryRunner.query('CREATE INDEX idx_audit_event_type ON audit_event (type)')
        await queryRunner.query('CREATE INDEX idx_audit_event_actor ON audit_event ("actorUserId")')
        await queryRunner.query('CREATE INDEX idx_audit_event_target ON audit_event ("targetType")')
        await queryRunner.query('CREATE INDEX idx_audit_event_created ON audit_event ("createdAt")')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('org_user_mapping')
        await queryRunner.dropTable('org_role_mapping')
        await queryRunner.dropTable('org_department')
        await queryRunner.dropTable('sso_simulation_session')
        await queryRunner.dropTable('sso_simulation_code')
        await queryRunner.dropTable('governance_retention_policy')
        await queryRunner.dropTable('audit_event')
    }
}
