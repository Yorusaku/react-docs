import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { PageEntity } from './page.entity'
import { TagEntity } from './tag.entity'

@Entity({ name: 'page_tag' })
export class PageTagEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
    page: PageEntity

    @ManyToOne(() => TagEntity, { onDelete: 'CASCADE' })
    tag: TagEntity

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}
