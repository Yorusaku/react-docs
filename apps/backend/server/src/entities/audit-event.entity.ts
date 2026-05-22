import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

// 审计事件实体
// 记录系统中所有关键操作，支持按类型/操作者/目标/时间范围查询
@Entity({ name: 'audit_event' })
export class AuditEventEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 80, unique: true })
    eventId: string

    @Index()
    @Column({ type: 'varchar', length: 100 })
    type: string

    @Index()
    @Column({ type: 'integer', nullable: true })
    actorUserId: number | null

    @Index()
    @Column({ type: 'varchar', length: 100 })
    targetType: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    targetId: string | null

    @Column({ type: 'varchar', length: 500 })
    summary: string

    @Column({ type: 'jsonb', default: '{}' })
    meta: Record<string, unknown>

    @Index()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}
