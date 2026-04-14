import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { PageEntity } from './page.entity'
import { UserEntity } from './user.entity'

export type PageSnapshotReason = 'manual' | 'before_restore'

@Entity({ name: 'page_snapshot' })
export class PageSnapshotEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 80, unique: true })
    snapshotId: string

    @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
    page: PageEntity

    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
    createdBy: UserEntity | null

    @Column({ type: 'varchar', length: 255 })
    title: string

    @Column({ type: 'varchar', length: 32, default: 'manual' })
    reason: PageSnapshotReason

    @Column({ type: 'text' })
    documentUpdate: string

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: true })
    expireAt: Date | null
}
