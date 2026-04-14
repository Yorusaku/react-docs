import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { Repository } from 'typeorm'
import { PostgresqlPersistence } from 'y-postgresql'
import * as Y from 'yjs'

import { PageEntity } from '../../entities/page.entity'
import { TemplateEntity } from '../../entities/template.entity'
import { UserEntity } from '../../entities/user.entity'
import { PageService } from '../page/page.service'
import { PageAccessService } from '../page/page-access.service'

const roomNameByPageId = (pageId: string) => `doc-yjs/miaoma-doc-${pageId}`

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(TemplateEntity)
        private readonly templateRepository: Repository<TemplateEntity>,
        private readonly pageService: PageService,
        private readonly pageAccessService: PageAccessService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject('YJS_POSTGRESQL_ADAPTER') private readonly yjsPostgresqlAdapter: PostgresqlPersistence
    ) {}

    private async getCurrentDocUpdate(pageId: string) {
        const ydoc = await this.yjsPostgresqlAdapter.getYDoc(roomNameByPageId(pageId))
        const update = Buffer.from(ydoc ? Y.encodeStateAsUpdate(ydoc) : new Uint8Array())
        return update.toString('base64')
    }

    async list() {
        return this.templateRepository.find({
            where: { deletedAt: null },
            order: { createdAt: 'DESC' },
        })
    }

    async create(payload: {
        name: string
        emoji: string
        title: string
        description?: string
        createdById: number
        documentUpdate: string
    }) {
        await this.pageAccessService.assertHasTemplateManagePermission(payload.createdById)
        const creator = await this.userRepository.findOne({ where: { id: payload.createdById } })
        if (!creator) {
            throw new NotFoundException('user not found')
        }

        const template = this.templateRepository.create({
            templateId: 'tpl' + nanoid(8),
            name: payload.name.trim(),
            emoji: payload.emoji,
            title: payload.title.trim(),
            description: payload.description?.trim() ?? null,
            documentUpdate: payload.documentUpdate,
            createdBy: creator,
        })
        return this.templateRepository.save(template)
    }

    async createFromPage(pageId: string, userId: number) {
        await this.pageAccessService.assertAction(pageId, userId, 'template_manage')
        const page = await this.pageService.fetch({ pageId, userId })
        const update = await this.getCurrentDocUpdate(page.pageId)
        return this.create({
            name: `${page.title} 模板`,
            emoji: page.emoji,
            title: page.title,
            description: page.description ?? '',
            createdById: userId,
            documentUpdate: update,
        })
    }

    async update(
        templateId: string,
        userId: number,
        payload: { name?: string; emoji?: string; title?: string; description?: string | null }
    ) {
        await this.pageAccessService.assertHasTemplateManagePermission(userId)
        const template = await this.templateRepository.findOne({
            where: { templateId, deletedAt: null },
        })
        if (!template) {
            throw new NotFoundException('template not found')
        }

        if (typeof payload.name === 'string') {
            template.name = payload.name.trim()
        }
        if (typeof payload.emoji === 'string') {
            template.emoji = payload.emoji
        }
        if (typeof payload.title === 'string') {
            template.title = payload.title.trim()
        }
        if (payload.description !== undefined) {
            template.description = payload.description ? payload.description.trim() : null
        }
        template.updatedAt = new Date()
        return this.templateRepository.save(template)
    }

    async remove(templateId: string, userId: number) {
        await this.pageAccessService.assertHasTemplateManagePermission(userId)
        const template = await this.templateRepository.findOne({
            where: { templateId, deletedAt: null },
        })
        if (!template) {
            throw new NotFoundException('template not found')
        }
        template.deletedAt = new Date()
        template.updatedAt = new Date()
        await this.templateRepository.save(template)
        return { templateId }
    }

    async createPageFromTemplate(templateId: string, userId: number) {
        const template = await this.templateRepository.findOne({
            where: { templateId, deletedAt: null },
        })
        if (!template) {
            throw new NotFoundException('template not found')
        }

        const user = new UserEntity()
        user.id = userId

        const page = new PageEntity({
            pageId: 'page' + nanoid(6),
            emoji: template.emoji,
            title: template.title,
            description: template.description ?? null,
            user,
        })
        const created = await this.pageService.create(page, userId)

        await this.yjsPostgresqlAdapter.clearDocument(roomNameByPageId(created.pageId))
        const update = Buffer.from(template.documentUpdate, 'base64')
        await this.yjsPostgresqlAdapter.storeUpdate(roomNameByPageId(created.pageId), new Uint8Array(update))

        return created
    }
}
