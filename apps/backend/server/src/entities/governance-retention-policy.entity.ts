import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

// 治理留存策略（单行配置表）
// 控制快照保留天数、回收站清理阈值、审计事件保留天数
@Entity({ name: 'governance_retention_policy' })
export class GovernanceRetentionPolicyEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'integer', default: 30 })
    snapshotDays: number

    @Column({ type: 'integer', default: 30 })
    trashDays: number

    @Column({ type: 'integer', default: 90 })
    auditDays: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}
