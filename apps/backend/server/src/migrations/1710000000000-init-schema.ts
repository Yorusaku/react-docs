import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class InitSchema1710000000000 implements MigrationInterface {
    name = 'InitSchema1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasUser = await queryRunner.hasTable('user')
        if (!hasUser) {
            await queryRunner.createTable(
                new Table({
                    name: 'user',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'username', type: 'varchar', isNullable: false, isUnique: true },
                        { name: 'password', type: 'varchar', isNullable: false },
                        { name: 'email', type: 'varchar', isNullable: true },
                        { name: 'phone', type: 'varchar', isNullable: true },
                        { name: 'role', type: 'varchar', isNullable: true },
                    ],
                })
            )
        }

        const hasApplication = await queryRunner.hasTable('application')
        if (!hasApplication) {
            await queryRunner.createTable(
                new Table({
                    name: 'application',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'appId', type: 'varchar', length: '80' },
                        { name: 'type', type: 'enum', enum: ['vanilla', 'react', 'vue'] },
                        { name: 'name', type: 'varchar', length: '255' },
                        { name: 'description', type: 'text', isNullable: true },
                        { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: true },
                        { name: 'updatedAt', type: 'timestamp', isNullable: true },
                        { name: 'userId', type: 'int', isNullable: true },
                    ],
                })
            )
            await queryRunner.createForeignKey(
                'application',
                new TableForeignKey({
                    columnNames: ['userId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                })
            )
        }

        const hasPage = await queryRunner.hasTable('page')
        if (!hasPage) {
            await queryRunner.createTable(
                new Table({
                    name: 'page',
                    columns: [
                        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                        { name: 'pageId', type: 'varchar', length: '80' },
                        { name: 'emoji', type: 'varchar', length: '8' },
                        { name: 'title', type: 'varchar', length: '255' },
                        { name: 'description', type: 'text', isNullable: true },
                        { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: true },
                        { name: 'userId', type: 'int', isNullable: true },
                    ],
                })
            )
            await queryRunner.createForeignKey(
                'page',
                new TableForeignKey({
                    columnNames: ['userId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                })
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasPage = await queryRunner.hasTable('page')
        if (hasPage) {
            await queryRunner.dropTable('page')
        }

        const hasApplication = await queryRunner.hasTable('application')
        if (hasApplication) {
            await queryRunner.dropTable('application')
        }

        const hasUser = await queryRunner.hasTable('user')
        if (hasUser) {
            await queryRunner.dropTable('user')
        }
    }
}
