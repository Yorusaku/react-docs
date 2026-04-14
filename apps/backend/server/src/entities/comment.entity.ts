import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { PageEntity } from './page.entity'
import { UserEntity } from './user.entity'

@Entity({ name: 'comment' })
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 80, unique: true })
    commentId: string

    @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
    page: PageEntity

    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
    author: UserEntity | null

    @ManyToOne(() => CommentEntity, { onDelete: 'SET NULL', nullable: true })
    parentComment: CommentEntity | null

    @Column({ type: 'jsonb', nullable: true })
    anchor: Record<string, unknown> | null

    @Column({ type: 'text' })
    content: string

    @Column({ type: 'boolean', default: false })
    resolved: boolean

    @Column({ type: 'boolean', default: false })
    hidden: boolean

    @Column({ type: 'jsonb', default: () => "'[]'" })
    mentionUserIds: number[]

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date

    @Column({ type: 'timestamp', nullable: true })
    deletedAt: Date | null
}
