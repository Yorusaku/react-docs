import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { PageEntity } from './page.entity'

@Entity({ name: 'page_search_index' })
export class PageSearchIndexEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
    page: PageEntity

    @Column({ type: 'text' })
    title: string

    @Column({ type: 'text' })
    bodyText: string

    @Column({ type: 'text' })
    tagsText: string

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}
