import { join } from 'node:path'

import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { GovernanceService } from '../../src/modules/governance/governance.service'

describe('GovernanceService (RED)', () => {
    let module: TestingModule
    let ds: DataSource
    let governanceService: GovernanceService

    const testDb = process.env.PG_DATABASE_TEST ?? 'miaoma_test'
    const pgHost = process.env.PG_HOST ?? 'localhost'
    const pgPort = Number(process.env.PG_PORT ?? 5432)
    const pgUser = process.env.PG_USER ?? 'postgres'
    const pgPassword = process.env.PG_PASSWORD ?? 'postgres'

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres', host: pgHost, port: pgPort, username: pgUser,
                    password: pgPassword, database: testDb,
                    entities: [join(__dirname, '../../src', '**/**.entity{.ts,.js}')],
                    synchronize: true,
                }),
            ],
            providers: [GovernanceService],
        }).compile()

        ds = module.get(DataSource)
        governanceService = module.get(GovernanceService)
    })

    afterAll(async () => { await module?.close() })

    describe('getRetentionPolicy', () => {
        it('首次调用返回默认值 {snapshotDays:30, trashDays:30, auditDays:90}', async () => {
            const policy = await governanceService.getRetentionPolicy()
            expect(policy.snapshotDays).toBe(30)
            expect(policy.trashDays).toBe(30)
            expect(policy.auditDays).toBe(90)
        })
    })

    describe('updateRetentionPolicy', () => {
        it('更新并返回新值', async () => {
            const updated = await governanceService.updateRetentionPolicy({
                snapshotDays: 60, trashDays: 60, auditDays: 180,
            })
            expect(updated.snapshotDays).toBe(60)
            expect(updated.trashDays).toBe(60)
            expect(updated.auditDays).toBe(180)
        })

        it('持久化：GET 返回更新后的值', async () => {
            await governanceService.updateRetentionPolicy({ snapshotDays: 15, trashDays: 15, auditDays: 45 })
            const policy = await governanceService.getRetentionPolicy()
            expect(policy.snapshotDays).toBe(15)
        })

        it('钳位：负数 → 最小值 1', async () => {
            const updated = await governanceService.updateRetentionPolicy({ snapshotDays: -5, trashDays: 0, auditDays: 90 })
            expect(updated.snapshotDays).toBeGreaterThanOrEqual(1)
            expect(updated.trashDays).toBeGreaterThanOrEqual(1)
        })
    })
})
