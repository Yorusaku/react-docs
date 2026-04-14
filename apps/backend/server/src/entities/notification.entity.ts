import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { UserEntity } from './user.entity'

@Entity({ name: 'notification' })
export class NotificationEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 80, unique: true })
    notificationId: string

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    user: UserEntity

    @Column({ type: 'varchar', length: 32 })
    type: string

    @Column({ type: 'varchar', length: 255 })
    title: string

    @Column({ type: 'text', nullable: true })
    content: string | null

    @Column({ type: 'jsonb', default: () => "'{}'" })
    payload: Record<string, unknown>

    @Column({ type: 'timestamp', nullable: true })
    readAt: Date | null

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}
