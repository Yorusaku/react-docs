import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { PageEntity } from './page.entity'

@Entity({ name: 'search_index_job' })
export class SearchIndexJobEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
    page: PageEntity

    @Column({ type: 'varchar', length: 32 })
    reason: string

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: true })
    processedAt: Date | null
}
