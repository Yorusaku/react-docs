import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { DocOperation, DocRole } from '../modules/page/page-acl.constants'
import { PageEntity } from './page.entity'
import { UserEntity } from './user.entity'

@Entity({ name: 'page_member' })
export class PageMemberEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
    page: PageEntity

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    user: UserEntity

    @Column({ type: 'varchar', length: 20 })
    role: DocRole

    @Column({ type: 'jsonb', default: () => "'[]'" })
    operations: DocOperation[]

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}
