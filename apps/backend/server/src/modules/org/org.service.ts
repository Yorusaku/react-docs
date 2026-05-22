import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserEntity } from '../../../entities/user.entity'
import { OrgDepartmentEntity, OrgRoleMappingEntity, OrgUserMappingEntity } from '../../../entities/org-entities.entity'
import { AuditService } from '../../audit/audit.service'

const DEFAULT_DEPARTMENTS = [
    { departmentId: 'dept-eng', name: '工程部' },
    { departmentId: 'dept-product', name: '产品部' },
    { departmentId: 'dept-design', name: '设计部' },
    { departmentId: 'dept-ops', name: '运维部' },
]

const DEFAULT_ROLE_MAPPINGS = [
    { position: 'manager', defaultRole: 'editor' },
    { position: 'engineer', defaultRole: 'editor' },
    { position: 'intern', defaultRole: 'viewer' },
]

@Injectable()
export class OrgService {
    constructor(
        @InjectRepository(OrgDepartmentEntity)
        private readonly deptRepo: Repository<OrgDepartmentEntity>,
        @InjectRepository(OrgRoleMappingEntity)
        private readonly roleMappingRepo: Repository<OrgRoleMappingEntity>,
        @InjectRepository(OrgUserMappingEntity)
        private readonly userMappingRepo: Repository<OrgUserMappingEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly auditService: AuditService,
    ) {}

    async getMappings() {
        await this.seedDefaults()

        const [departments, roleMappings, userMappings] = await Promise.all([
            this.deptRepo.find(),
            this.roleMappingRepo.find(),
            this.userMappingRepo.find(),
        ])

        return {
            departments: departments.map(d => ({ id: d.departmentId, name: d.name })),
            roleMappings: roleMappings.map(r => ({ position: r.position, defaultRole: r.defaultRole })),
            users: userMappings.map(u => ({
                userId: u.userId,
                username: u.username,
                departmentId: u.departmentId,
                position: u.position,
                defaultRole: u.defaultRole,
            })),
        }
    }

    async updateMapping(payload: { userId: number; departmentId?: string; position?: string }) {
        const user = await this.userRepo.findOne({ where: { id: payload.userId } })
        if (!user) throw new NotFoundException('user not found')

        let mapping = await this.userMappingRepo.findOne({ where: { userId: payload.userId } })
        if (!mapping) {
            mapping = this.userMappingRepo.create({
                userId: payload.userId,
                username: user.username,
                departmentId: payload.departmentId ?? null,
                position: payload.position ?? null,
                defaultRole: 'viewer',
            })
        }

        if (payload.departmentId !== undefined) mapping.departmentId = payload.departmentId
        if (payload.position !== undefined) mapping.position = payload.position
        mapping.updatedAt = new Date()

        // 根据职位自动匹配默认角色
        if (mapping.position) {
            const roleMapping = await this.roleMappingRepo.findOne({ where: { position: mapping.position } })
            if (roleMapping) mapping.defaultRole = roleMapping.defaultRole
        }

        await this.userMappingRepo.save(mapping)

        await this.auditService.emit({
            type: 'org_mapping_update',
            summary: `组织映射更新: ${user.username}`,
            actorUserId: payload.userId,
            targetType: 'org',
            targetId: String(payload.userId),
            meta: { departmentId: mapping.departmentId, position: mapping.position, defaultRole: mapping.defaultRole },
        })
    }

    private async seedDefaults() {
        const existingDepts = await this.deptRepo.count()
        if (existingDepts === 0) {
            for (const d of DEFAULT_DEPARTMENTS) {
                await this.deptRepo.save(this.deptRepo.create(d))
            }
        }

        const existingRoles = await this.roleMappingRepo.count()
        if (existingRoles === 0) {
            for (const r of DEFAULT_ROLE_MAPPINGS) {
                await this.roleMappingRepo.save(this.roleMappingRepo.create(r))
            }
        }
    }
}
