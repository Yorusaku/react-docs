import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { UserEntity } from './user.entity'

@Entity({ name: 'template' })
export class TemplateEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 80, unique: true })
    templateId: string

    @Column({ type: 'varchar', length: 120 })
    name: string

    @Column({ type: 'varchar', length: 8 })
    emoji: string

    @Column({ type: 'varchar', length: 255 })
    title: string

    @Column({ type: 'text', nullable: true })
    description: string | null

    @Column({ type: 'text' })
    documentUpdate: string

    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
    createdBy: UserEntity | null

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: true })
    updatedAt: Date | null

    @Column({ type: 'timestamp', nullable: true })
    deletedAt: Date | null
}
