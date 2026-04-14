import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex, TableUnique } from 'typeorm'

export class BusinessV11723500000000 implements MigrationInterface {
    name = 'BusinessV11723500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasUpdatedAt = await queryRunner.hasColumn('page', 'updatedAt')
        if (!hasUpdatedAt) {
            await queryRunner.addColumn(
                'page',
                new TableColumn({
                    name: 'updatedAt',
                    type: 'timestamp',
                    isNullable: false,
                    default: 'CURRENT_TIMESTAMP',
                })
            )
        }

        const hasDeletedAt = await queryRunner.hasColumn('page', 'deletedAt')
        if (!hasDeletedAt) {
            await queryRunner.addColumn(
                'page',
                new TableColumn({
                    name: 'deletedAt',
                    type: 'timestamp',
                    isNullable: true,
                })
            )
        }

        const hasLastSnapshotAt = await queryRunner.hasColumn('page', 'lastSnapshotAt')
        if (!hasLastSnapshotAt) {
            await queryRunner.addColumn(
                'page',
                new TableColumn({
                    name: 'lastSnapshotAt',
                    type: 'timestamp',
                    isNullable: true,
                })
            )
        }

        const hasPageMember = await queryRunner.hasTable('page_member')
        if (!hasPageMember) {
            await queryRunner.createTable(
                new Table({
                    name: 'page_member',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'pageId', type: 'int', isNullable: false },
                        { name: 'userId', type: 'int', isNullable: false },
                        { name: 'role', type: 'varchar', length: '20', isNullable: false },
                        { name: 'operations', type: 'jsonb', default: "'[]'", isNullable: false },
                        { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
                        { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
                    ],
                })
            )
            await queryRunner.createForeignKeys('page_member', [
                new TableForeignKey({
                    columnNames: ['pageId'],
                    referencedTableName: 'page',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
                new TableForeignKey({
                    columnNames: ['userId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            ])
            await queryRunner.createUniqueConstraint(
                'page_member',
                new TableUnique({
                    columnNames: ['pageId', 'userId'],
                    name: 'UQ_page_member_page_user',
                })
            )
            await queryRunner.createIndex(
                'page_member',
                new TableIndex({
                    name: 'IDX_page_member_page',
                    columnNames: ['pageId'],
                })
            )
            await queryRunner.createIndex(
                'page_member',
                new TableIndex({
                    name: 'IDX_page_member_user',
                    columnNames: ['userId'],
                })
            )
        }

        await queryRunner.query(`
            INSERT INTO "page_member" ("pageId", "userId", "role", "operations", "createdAt", "updatedAt")
            SELECT p."id", p."userId", 'owner', '[]'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM "page" p
            WHERE p."userId" IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM "page_member" m WHERE m."pageId" = p."id" AND m."userId" = p."userId"
            )
        `)

        const hasPageSnapshot = await queryRunner.hasTable('page_snapshot')
        if (!hasPageSnapshot) {
            await queryRunner.createTable(
                new Table({
                    name: 'page_snapshot',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'snapshotId', type: 'varchar', length: '80', isNullable: false, isUnique: true },
                        { name: 'pageId', type: 'int', isNullable: false },
                        { name: 'createdById', type: 'int', isNullable: true },
                        { name: 'title', type: 'varchar', length: '255', isNullable: false },
                        { name: 'reason', type: 'varchar', length: '32', isNullable: false, default: "'manual'" },
                        { name: 'documentUpdate', type: 'text', isNullable: false },
                        { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                        { name: 'expireAt', type: 'timestamp', isNullable: true },
                    ],
                })
            )
            await queryRunner.createForeignKeys('page_snapshot', [
                new TableForeignKey({
                    columnNames: ['pageId'],
                    referencedTableName: 'page',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
                new TableForeignKey({
                    columnNames: ['createdById'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            ])
            await queryRunner.createIndex(
                'page_snapshot',
                new TableIndex({
                    name: 'IDX_page_snapshot_page',
                    columnNames: ['pageId'],
                })
            )
        }

        const hasComment = await queryRunner.hasTable('comment')
        if (!hasComment) {
            await queryRunner.createTable(
                new Table({
                    name: 'comment',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'commentId', type: 'varchar', length: '80', isNullable: false, isUnique: true },
                        { name: 'pageId', type: 'int', isNullable: false },
                        { name: 'authorId', type: 'int', isNullable: true },
                        { name: 'parentCommentId', type: 'int', isNullable: true },
                        { name: 'anchor', type: 'jsonb', isNullable: true },
                        { name: 'content', type: 'text', isNullable: false },
                        { name: 'resolved', type: 'boolean', isNullable: false, default: false },
                        { name: 'hidden', type: 'boolean', isNullable: false, default: false },
                        { name: 'mentionUserIds', type: 'jsonb', isNullable: false, default: "'[]'" },
                        { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                        { name: 'updatedAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deletedAt', type: 'timestamp', isNullable: true },
                    ],
                })
            )
            await queryRunner.createForeignKeys('comment', [
                new TableForeignKey({
                    columnNames: ['pageId'],
                    referencedTableName: 'page',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
                new TableForeignKey({
                    columnNames: ['authorId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
                new TableForeignKey({
                    columnNames: ['parentCommentId'],
                    referencedTableName: 'comment',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            ])
            await queryRunner.createIndex(
                'comment',
                new TableIndex({
                    name: 'IDX_comment_page',
                    columnNames: ['pageId'],
                })
            )
        }

        const hasNotification = await queryRunner.hasTable('notification')
        if (!hasNotification) {
            await queryRunner.createTable(
                new Table({
                    name: 'notification',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'notificationId', type: 'varchar', length: '80', isNullable: false, isUnique: true },
                        { name: 'userId', type: 'int', isNullable: false },
                        { name: 'type', type: 'varchar', length: '32', isNullable: false },
                        { name: 'title', type: 'varchar', length: '255', isNullable: false },
                        { name: 'content', type: 'text', isNullable: true },
                        { name: 'payload', type: 'jsonb', isNullable: false, default: "'{}'" },
                        { name: 'readAt', type: 'timestamp', isNullable: true },
                        { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                    ],
                })
            )
            await queryRunner.createForeignKey(
                'notification',
                new TableForeignKey({
                    columnNames: ['userId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                })
            )
            await queryRunner.createIndex(
                'notification',
                new TableIndex({
                    name: 'IDX_notification_user_created',
                    columnNames: ['userId', 'createdAt'],
                })
            )
        }

        const hasTag = await queryRunner.hasTable('tag')
        if (!hasTag) {
            await queryRunner.createTable(
                new Table({
                    name: 'tag',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'tagId', type: 'varchar', length: '80', isNullable: false, isUnique: true },
                        { name: 'name', type: 'varchar', length: '80', isNullable: false },
                        { name: 'normalizedName', type: 'varchar', length: '80', isNullable: false, isUnique: true },
                        { name: 'createdById', type: 'int', isNullable: true },
                        { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                        { name: 'updatedAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                    ],
                })
            )
            await queryRunner.createForeignKey(
                'tag',
                new TableForeignKey({
                    columnNames: ['createdById'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                })
            )
        }

        const hasPageTag = await queryRunner.hasTable('page_tag')
        if (!hasPageTag) {
            await queryRunner.createTable(
                new Table({
                    name: 'page_tag',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'pageId', type: 'int', isNullable: false },
                        { name: 'tagId', type: 'int', isNullable: false },
                        { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                    ],
                })
            )
            await queryRunner.createForeignKeys('page_tag', [
                new TableForeignKey({
                    columnNames: ['pageId'],
                    referencedTableName: 'page',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
                new TableForeignKey({
                    columnNames: ['tagId'],
                    referencedTableName: 'tag',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            ])
            await queryRunner.createUniqueConstraint(
                'page_tag',
                new TableUnique({
                    columnNames: ['pageId', 'tagId'],
                    name: 'UQ_page_tag_page_tag',
                })
            )
            await queryRunner.createIndex(
                'page_tag',
                new TableIndex({
                    name: 'IDX_page_tag_page',
                    columnNames: ['pageId'],
                })
            )
        }

        const hasTemplate = await queryRunner.hasTable('template')
        if (!hasTemplate) {
            await queryRunner.createTable(
                new Table({
                    name: 'template',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'templateId', type: 'varchar', length: '80', isNullable: false, isUnique: true },
                        { name: 'name', type: 'varchar', length: '120', isNullable: false },
                        { name: 'emoji', type: 'varchar', length: '8', isNullable: false },
                        { name: 'title', type: 'varchar', length: '255', isNullable: false },
                        { name: 'description', type: 'text', isNullable: true },
                        { name: 'documentUpdate', type: 'text', isNullable: false },
                        { name: 'createdById', type: 'int', isNullable: true },
                        { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                        { name: 'updatedAt', type: 'timestamp', isNullable: true },
                        { name: 'deletedAt', type: 'timestamp', isNullable: true },
                    ],
                })
            )
            await queryRunner.createForeignKey(
                'template',
                new TableForeignKey({
                    columnNames: ['createdById'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                })
            )
        }

        const hasPageSearchIndex = await queryRunner.hasTable('page_search_index')
        if (!hasPageSearchIndex) {
            await queryRunner.createTable(
                new Table({
                    name: 'page_search_index',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'pageId', type: 'int', isNullable: false, isUnique: true },
                        { name: 'title', type: 'text', isNullable: false },
                        { name: 'bodyText', type: 'text', isNullable: false },
                        { name: 'tagsText', type: 'text', isNullable: false },
                        { name: 'updatedAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                    ],
                })
            )
            await queryRunner.createForeignKey(
                'page_search_index',
                new TableForeignKey({
                    columnNames: ['pageId'],
                    referencedTableName: 'page',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                })
            )
        }

        const hasSearchIndexJob = await queryRunner.hasTable('search_index_job')
        if (!hasSearchIndexJob) {
            await queryRunner.createTable(
                new Table({
                    name: 'search_index_job',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'pageId', type: 'int', isNullable: false },
                        { name: 'reason', type: 'varchar', length: '32', isNullable: false },
                        { name: 'createdAt', type: 'timestamp', isNullable: false, default: 'CURRENT_TIMESTAMP' },
                        { name: 'processedAt', type: 'timestamp', isNullable: true },
                    ],
                })
            )
            await queryRunner.createForeignKey(
                'search_index_job',
                new TableForeignKey({
                    columnNames: ['pageId'],
                    referencedTableName: 'page',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                })
            )
            await queryRunner.createIndex(
                'search_index_job',
                new TableIndex({
                    name: 'IDX_search_index_job_pending',
                    columnNames: ['processedAt', 'createdAt'],
                })
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('search_index_job')) {
            await queryRunner.dropTable('search_index_job')
        }
        if (await queryRunner.hasTable('page_search_index')) {
            await queryRunner.dropTable('page_search_index')
        }
        if (await queryRunner.hasTable('template')) {
            await queryRunner.dropTable('template')
        }
        if (await queryRunner.hasTable('page_tag')) {
            await queryRunner.dropTable('page_tag')
        }
        if (await queryRunner.hasTable('tag')) {
            await queryRunner.dropTable('tag')
        }
        if (await queryRunner.hasTable('notification')) {
            await queryRunner.dropTable('notification')
        }
        if (await queryRunner.hasTable('comment')) {
            await queryRunner.dropTable('comment')
        }
        if (await queryRunner.hasTable('page_snapshot')) {
            await queryRunner.dropTable('page_snapshot')
        }
        if (await queryRunner.hasTable('page_member')) {
            await queryRunner.dropTable('page_member')
        }

        if (await queryRunner.hasColumn('page', 'lastSnapshotAt')) {
            await queryRunner.dropColumn('page', 'lastSnapshotAt')
        }
        if (await queryRunner.hasColumn('page', 'deletedAt')) {
            await queryRunner.dropColumn('page', 'deletedAt')
        }
        if (await queryRunner.hasColumn('page', 'updatedAt')) {
            await queryRunner.dropColumn('page', 'updatedAt')
        }
    }
}
