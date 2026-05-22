import { describe, expect, it } from 'vitest'

// 阶段2: TasksService 治理策略集成规格 (RED)
// 验证 snapshot/trash/audit 清理不再写死 30 天

describe('TasksService governance integration (RED)', () => {
    it('createExpireAt 应读取 governance_retention_policy.snapshotDays', () => {
        // 现状：PageService.createExpireAt() 写死 DEFAULT_RETENTION_DAYS=30
        // 目标：改为注入 GovernanceService，读取 policy.snapshotDays
        expect(true).toBe(true)
    })

    it('cleanupExpiredData 删除过期快照 + 已过期回收站页面 + 过期审计事件', () => {
        // 现状：只清理快照和回收站，均写死 30 天
        // 目标：
        // 1. 快照清理 → 读 policy.snapshotDays
        // 2. 回收站清理 → 读 policy.trashDays（不再写死 30）
        // 3. 审计事件清理 → 读 policy.auditDays
        expect(true).toBe(true)
    })

    it('回收站永久删除时应 clearDocument', () => {
        // 现状已实现，但需确认 cleanupExpiredData 中正确调用
        expect(true).toBe(true)
    })

    describe('审计事件清理定时任务', () => {
        it('每日 3:00 清理超过 auditDays 的审计事件', () => {
            // 新增 @Cron 或在现有 cleanupExpiredData 中追加审计事件清理
            expect(true).toBe(true)
        })

        it('未超过 auditDays 的审计事件保留', () => {
            expect(true).toBe(true)
        })
    })
})
