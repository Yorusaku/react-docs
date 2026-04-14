import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { UserEntity } from './user.entity'

@Entity({ name: 'tag' })
export class TagEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 80, unique: true })
    tagId: string

    @Column({ type: 'varchar', length: 80 })
    name: string

    @Column({ type: 'varchar', length: 80, unique: true })
    normalizedName: string

    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
    createdBy: UserEntity | null

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}
