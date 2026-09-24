import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { GovernanceRetentionPolicyEntity } from '../../src/entities/governance-retention-policy.entity'
import { GovernanceService } from '../../src/modules/governance/governance.service'
import { integrationTypeOrmOptions, resetIntegrationTables } from './support/test-database'

describe('GovernanceService Integration', () => {
    let module: TestingModule
    let governanceService: GovernanceService

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [TypeOrmModule.forRoot(integrationTypeOrmOptions()), TypeOrmModule.forFeature([GovernanceRetentionPolicyEntity])],
            providers: [GovernanceService],
        }).compile()

        governanceService = module.get(GovernanceService)
        await resetIntegrationTables(module.get(DataSource), ['governance_retention_policy'])
    })

    afterAll(async () => {
        await module?.close()
    })

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
                snapshotDays: 60,
                trashDays: 60,
                auditDays: 180,
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
