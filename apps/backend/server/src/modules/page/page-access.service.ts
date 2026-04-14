import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PageEntity } from '../../entities/page.entity'
import { PageMemberEntity } from '../../entities/page-member.entity'
import { UserEntity } from '../../entities/user.entity'
import { DocAction, DocOperation, DocRole, hasRoleAction } from './page-acl.constants'

export interface AccessContext {
    page: PageEntity
    member: PageMemberEntity
}

@Injectable()
export class PageAccessService {
    constructor(
        @InjectRepository(PageEntity)
        private readonly pageRepository: Repository<PageEntity>,
        @InjectRepository(PageMemberEntity)
        private readonly pageMemberRepository: Repository<PageMemberEntity>
    ) {}

    async createOwnerMember(page: PageEntity, userId: number) {
        const user = new UserEntity()
        user.id = userId

        const member = this.pageMemberRepository.create({
            page,
            user,
            role: 'owner',
            operations: [],
        })
        await this.pageMemberRepository.save(member)
    }

    async findPageByPageId(pageId: string, includeDeleted = false) {
        const page = await this.pageRepository.findOne({ where: { pageId } })
        if (!page || (!includeDeleted && page.deletedAt)) {
            throw new NotFoundException('page not found')
        }
        return page
    }

    async findMember(pageId: string, userId: number): Promise<PageMemberEntity | null> {
        return this.pageMemberRepository.findOne({
            where: {
                page: { pageId },
                user: { id: userId },
            },
            relations: ['page', 'user'],
        })
    }

    async assertAction(pageId: string, userId: number, action: DocAction, options?: { includeDeleted?: boolean }): Promise<AccessContext> {
        const page = await this.findPageByPageId(pageId, options?.includeDeleted ?? false)
        const member = await this.findMember(pageId, userId)

        if (!member) {
            throw new ForbiddenException('member required')
        }

        if (!this.canAction(member.role, member.operations, action)) {
            throw new ForbiddenException('permission denied')
        }

        return { page, member }
    }

    async listMembers(pageId: string) {
        return this.pageMemberRepository.find({
            where: { page: { pageId } },
            relations: ['user'],
            order: { id: 'ASC' },
        })
    }

    async upsertMember(page: PageEntity, payload: { userId: number; role: DocRole; operations: DocOperation[] }) {
        const existing = await this.pageMemberRepository.findOne({
            where: { page: { id: page.id }, user: { id: payload.userId } },
            relations: ['user', 'page'],
        })

        if (existing) {
            existing.role = payload.role
            existing.operations = payload.operations
            existing.updatedAt = new Date()
            return this.pageMemberRepository.save(existing)
        }

        const user = new UserEntity()
        user.id = payload.userId
        const created = this.pageMemberRepository.create({
            page,
            user,
            role: payload.role,
            operations: payload.operations,
        })
        return this.pageMemberRepository.save(created)
    }

    async removeMember(page: PageEntity, targetUserId: number) {
        const target = await this.pageMemberRepository.findOne({
            where: { page: { id: page.id }, user: { id: targetUserId } },
        })

        if (!target) {
            throw new NotFoundException('member not found')
        }

        if (target.role === 'owner') {
            const ownerCount = await this.pageMemberRepository.count({
                where: { page: { id: page.id }, role: 'owner' },
            })
            if (ownerCount <= 1) {
                throw new ForbiddenException('at least one owner is required')
            }
        }

        await this.pageMemberRepository.delete({ id: target.id })
    }

    async assertHasTemplateManagePermission(userId: number) {
        const members = await this.pageMemberRepository.find({
            where: { user: { id: userId } },
            take: 200,
        })
        const hasPermission = members.some(member => this.canAction(member.role, member.operations ?? [], 'template_manage'))
        if (!hasPermission) {
            throw new ForbiddenException('permission denied')
        }
    }

    canAction(role: DocRole, operations: DocOperation[], action: DocAction): boolean {
        if (role === 'owner') {
            return true
        }
        if (hasRoleAction(role, action)) {
            return true
        }
        return operations.includes(action as DocOperation)
    }
}
