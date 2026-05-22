import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

// 组织部门
@Entity({ name: 'org_department' })
export class OrgDepartmentEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 80 })
    departmentId: string

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}

// 组织角色映射（职位 → 默认文档角色）
@Entity({ name: 'org_role_mapping' })
export class OrgRoleMappingEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 100, unique: true })
    position: string

    @Column({ type: 'varchar', length: 50, default: 'viewer' })
    defaultRole: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}

// 组织用户映射（用户 → 部门 + 职位）
@Entity({ name: 'org_user_mapping' })
export class OrgUserMappingEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'integer', unique: true })
    userId: number

    @Column({ type: 'varchar', length: 255 })
    username: string

    @Column({ type: 'varchar', length: 80, nullable: true })
    departmentId: string | null

    @Column({ type: 'varchar', length: 100, nullable: true })
    position: string | null

    @Column({ type: 'varchar', length: 50, default: 'viewer' })
    defaultRole: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}
