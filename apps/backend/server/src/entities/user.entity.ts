/*
 *   Copyright (c) 2024 濡欑爜瀛﹂櫌 @Heyi
 *   All rights reserved.
 *   濡欑爜瀛﹂櫌瀹樻柟鍑哄搧锛屼綔鑰?@Heyi锛屼緵瀛﹀憳瀛︿範浣跨敤锛屽彲鐢ㄤ綔缁冧範锛屽彲鐢ㄤ綔缇庡寲绠€鍘嗭紝涓嶅彲寮€婧愩€? */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'user' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 255 })
    username: string

    @Column({ type: 'varchar', length: 255 })
    password: string

    @Column({ type: 'varchar', nullable: true, length: 255 })
    email: string

    @Column({ type: 'varchar', nullable: true, length: 255 })
    phone: string

    @Column({ type: 'varchar', nullable: true, length: 100 })
    role: string
}
