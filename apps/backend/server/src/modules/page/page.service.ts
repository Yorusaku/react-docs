import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { In, Repository } from 'typeorm'
import { PostgresqlPersistence } from 'y-postgresql'
import * as Y from 'yjs'

import { PageEntity } from '../../entities/page.entity'
import { PageMemberEntity } from '../../entities/page-member.entity'
import { PageSearchIndexEntity } from '../../entities/page-search-index.entity'
import { PageSnapshotEntity } from '../../entities/page-snapshot.entity'
import { PageTagEntity } from '../../entities/page-tag.entity'
import { SearchIndexJobEntity } from '../../entities/search-index-job.entity'
import { TagEntity } from '../../entities/tag.entity'
import { UserEntity } from '../../entities/user.entity'
import { yjsXmlMentionCollect } from '../../utils/yjsXMLMentionCollect'
import { PageAccessService } from './page-access.service'
import { DocOperation, DocRole, isDocOperation, isDocRole } from './page-acl.constants'

const roomNameByPageId = (pageId: string) => `doc-yjs/miaoma-doc-${pageId}`
const yFragmentNameByPageId = (pageId: string) => `document-store-${pageId}`

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_RETENTION_DAYS = 30

const sanitizeTitle = (title: string) =>
    Array.from(title)
        .filter(char => {
            const code = char.charCodeAt(0)
            return code > 31 && code !== 127
        })
        .join('')
        .trim()
        .slice(0, 255)

const normalizeTagName = (tag: string) => tag.trim().slice(0, 80)
const normalizeTagKey = (tag: string) => normalizeTagName(tag).toLowerCase()
const stripXmlTags = (value: string) =>
    value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

@Injectable()
export class PageService {
    constructor(
        @InjectRepository(PageEntity)
        private readonly pageRepository: Repository<PageEntity>,
        @InjectRepository(PageMemberEntity)
        private readonly pageMemberRepository: Repository<PageMemberEntity>,
        @InjectRepository(PageSnapshotEntity)
        private readonly pageSnapshotRepository: Repository<PageSnapshotEntity>,
        @InjectRepository(TagEntity)
        private readonly tagRepository: Repository<TagEntity>,
        @InjectRepository(PageTagEntity)
        private readonly pageTagRepository: Repository<PageTagEntity>,
        @InjectRepository(SearchIndexJobEntity)
        private readonly searchIndexJobRepository: Repository<SearchIndexJobEntity>,
        @InjectRepository(PageSearchIndexEntity)
        private readonly pageSearchIndexRepository: Repository<PageSearchIndexEntity>,
        private readonly pageAccessService: PageAccessService,
        @Inject('YJS_POSTGRESQL_ADAPTER') private readonly yjsPostgresqlAdapter: PostgresqlPersistence
    ) {}

    private createExpireAt() {
        return new Date(Date.now() + DEFAULT_RETENTION_DAYS * DAY_MS)
    }

    private normalizeOperations(operations: string[]) {
        const deduped = Array.from(new Set(operations.filter(isDocOperation)))
        return deduped as DocOperation[]
    }

    private ensureRole(role: string): DocRole {
        return isDocRole(role) ? role : 'viewer'
    }

    private async enqueueSearchIndex(pageId: number, reason: string) {
        const page = new PageEntity()
        page.id = pageId
        const job = this.searchIndexJobRepository.create({
            page,
            reason,
            processedAt: null,
        })
        await this.searchIndexJobRepository.save(job)
    }

    private async collectLinks(pageId: string) {
        const docName = roomNameByPageId(pageId)
        const ydoc = await this.yjsPostgresqlAdapter.getYDoc(docName)
        const xml = ydoc.getXmlFragment(yFragmentNameByPageId(pageId)).toJSON()

        let rawLinks: unknown[] = []
        if (typeof xml === 'string' && xml.length > 0) {
            try {
                rawLinks = yjsXmlMentionCollect(xml)
            } catch {
                rawLinks = []
            }
        }

        return rawLinks.filter((item): item is string => typeof item === 'string' && item.length > 0)
    }

    private async encodeCurrentDocUpdate(pageId: string) {
        const docName = roomNameByPageId(pageId)
        const ydoc = await this.yjsPostgresqlAdapter.getYDoc(docName)
        const update = Y.encodeStateAsUpdate(ydoc)
        return Buffer.from(update).toString('base64')
    }

    private async createSnapshotInternal(payload: {
        page: PageEntity
        createdById?: number
        title?: string
        reason: 'manual' | 'before_restore'
    }) {
        const updateBase64 = await this.encodeCurrentDocUpdate(payload.page.pageId)
        const snapshot = this.pageSnapshotRepository.create({
            snapshotId: 'snapshot' + nanoid(8),
            page: payload.page,
            createdBy: payload.createdById
                ? (() => {
                      const user = new UserEntity()
                      user.id = payload.createdById
                      return user
                  })()
                : null,
            title: sanitizeTitle(payload.title ?? payload.page.title),
            reason: payload.reason,
            documentUpdate: updateBase64,
            expireAt: this.createExpireAt(),
        })
        const saved = await this.pageSnapshotRepository.save(snapshot)
        payload.page.lastSnapshotAt = new Date()
        payload.page.updatedAt = new Date()
        await this.pageRepository.save(payload.page)
        return saved
    }

    async create(payload: PageEntity, userId: number) {
        if (payload.title) {
            payload.title = sanitizeTitle(payload.title)
        }
        const now = new Date()
        payload.updatedAt = now
        payload.deletedAt = null
        payload.lastSnapshotAt = null

        const saved = await this.pageRepository.save(payload)
        await this.pageAccessService.createOwnerMember(saved, userId)
        await this.enqueueSearchIndex(saved.id, 'page_created')
        return saved
    }

    async update(payload: { pageId: string; title: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'write')
        page.title = sanitizeTitle(payload.title)
        page.updatedAt = new Date()
        const saved = await this.pageRepository.save(page)
        await this.enqueueSearchIndex(saved.id, 'title_updated')
        return saved
    }

    async fetch(params: { pageId: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(params.pageId, params.userId, 'read')
        return page
    }

    async list(params: { userId: number }) {
        const memberships = await this.pageMemberRepository.find({
            where: { user: { id: params.userId } },
            relations: ['page'],
            order: { id: 'DESC' },
        })

        const pages = memberships
            .map(member => member.page)
            .filter(page => !!page && !page.deletedAt)
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

        return {
            pages,
            count: pages.length,
        }
    }

    async listTrash(params: { userId: number }) {
        const memberships = await this.pageMemberRepository.find({
            where: { user: { id: params.userId } },
            relations: ['page'],
            order: { id: 'DESC' },
        })
        const pages = memberships
            .map(member => member.page)
            .filter(page => !!page && !!page.deletedAt)
            .sort((a, b) => +new Date(b.deletedAt ?? 0) - +new Date(a.deletedAt ?? 0))

        return {
            pages,
            count: pages.length,
        }
    }

    async softDelete(payload: { pageId: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'delete')
        page.deletedAt = new Date()
        page.updatedAt = new Date()
        await this.pageRepository.save(page)
        await this.enqueueSearchIndex(page.id, 'page_deleted')
        return { pageId: page.pageId }
    }

    async restore(payload: { pageId: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'restore', { includeDeleted: true })
        page.deletedAt = null
        page.updatedAt = new Date()
        await this.pageRepository.save(page)
        await this.enqueueSearchIndex(page.id, 'page_restored')
        return { pageId: page.pageId }
    }

    async permanentDelete(payload: { pageId: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'delete', { includeDeleted: true })
        await this.yjsPostgresqlAdapter.clearDocument(roomNameByPageId(page.pageId))
        await this.pageRepository.delete({ id: page.id })
        await this.pageSearchIndexRepository.delete({ page: { id: page.id } })
        return { pageId: payload.pageId }
    }

    async graph(userId: number) {
        const memberships = await this.pageMemberRepository.find({
            where: { user: { id: userId } },
            relations: ['page'],
            order: { id: 'DESC' },
        })
        const pages = memberships.map(member => member.page).filter(page => !!page && !page.deletedAt)

        const withLinksPages = await Promise.all(
            pages.map(async page => {
                const links = await this.collectLinks(page.pageId)
                return {
                    ...page,
                    links,
                }
            })
        )

        return withLinksPages
    }

    async getAcl(pageId: string, userId: number) {
        await this.pageAccessService.assertAction(pageId, userId, 'member_manage')
        const members = await this.pageAccessService.listMembers(pageId)
        return members.map(member => ({
            userId: member.user.id,
            username: member.user.username,
            role: member.role,
            operations: member.operations ?? [],
        }))
    }

    async updateAcl(pageId: string, userId: number, members: Array<{ userId: number; role: string; operations: string[] }>) {
        const { page } = await this.pageAccessService.assertAction(pageId, userId, 'member_manage')

        for (const item of members) {
            await this.pageAccessService.upsertMember(page, {
                userId: item.userId,
                role: this.ensureRole(item.role),
                operations: this.normalizeOperations(item.operations),
            })
        }

        return this.getAcl(pageId, userId)
    }

    async inviteMember(pageId: string, userId: number, payload: { username: string; role: string; operations: string[] }) {
        const { page } = await this.pageAccessService.assertAction(pageId, userId, 'invite_user')
        const user = await this.pageMemberRepository.manager.findOne(UserEntity, {
            where: { username: payload.username.trim() },
        })

        if (!user) {
            throw new NotFoundException('user not found')
        }

        const saved = await this.pageAccessService.upsertMember(page, {
            userId: user.id,
            role: this.ensureRole(payload.role),
            operations: this.normalizeOperations(payload.operations),
        })

        return {
            userId: saved.user.id,
            role: saved.role,
            operations: saved.operations,
        }
    }

    async removeMember(pageId: string, userId: number, targetUserId: number) {
        const { page } = await this.pageAccessService.assertAction(pageId, userId, 'member_manage')
        await this.pageAccessService.removeMember(page, targetUserId)
        return { userId: targetUserId }
    }

    async createSnapshot(pageId: string, userId: number, title?: string) {
        const { page } = await this.pageAccessService.assertAction(pageId, userId, 'read')
        const snapshot = await this.createSnapshotInternal({
            page,
            createdById: userId,
            title,
            reason: 'manual',
        })
        return {
            snapshotId: snapshot.snapshotId,
            title: snapshot.title,
            reason: snapshot.reason,
            createdAt: snapshot.createdAt,
            expireAt: snapshot.expireAt,
        }
    }

    async listSnapshots(pageId: string, userId: number) {
        await this.pageAccessService.assertAction(pageId, userId, 'read', { includeDeleted: true })
        const snapshots = await this.pageSnapshotRepository.find({
            where: { page: { pageId } },
            order: { createdAt: 'DESC' },
            relations: ['createdBy'],
        })
        return snapshots.map(snapshot => ({
            snapshotId: snapshot.snapshotId,
            title: snapshot.title,
            reason: snapshot.reason,
            createdAt: snapshot.createdAt,
            expireAt: snapshot.expireAt,
            createdBy: snapshot.createdBy
                ? {
                      id: snapshot.createdBy.id,
                      username: snapshot.createdBy.username,
                  }
                : null,
        }))
    }

    async restoreSnapshot(pageId: string, snapshotId: string, userId: number) {
        const { page } = await this.pageAccessService.assertAction(pageId, userId, 'write', { includeDeleted: true })
        const snapshot = await this.pageSnapshotRepository.findOne({
            where: {
                page: { pageId },
                snapshotId,
            },
            relations: ['page'],
        })
        if (!snapshot) {
            throw new NotFoundException('snapshot not found')
        }

        await this.createSnapshotInternal({
            page,
            createdById: userId,
            title: `${page.title} (auto backup before restore)`,
            reason: 'before_restore',
        })

        const update = Buffer.from(snapshot.documentUpdate, 'base64')
        await this.yjsPostgresqlAdapter.clearDocument(roomNameByPageId(page.pageId))
        await this.yjsPostgresqlAdapter.storeUpdate(roomNameByPageId(page.pageId), new Uint8Array(update))

        page.updatedAt = new Date()
        page.deletedAt = null
        await this.pageRepository.save(page)
        await this.enqueueSearchIndex(page.id, 'snapshot_restored')
        return { snapshotId }
    }

    async updatePageTags(pageId: string, userId: number, tags: string[]) {
        const { page } = await this.pageAccessService.assertAction(pageId, userId, 'write')

        const normalizedMap = new Map<string, { name: string; key: string }>()
        for (const rawTag of tags) {
            const name = normalizeTagName(rawTag)
            const key = normalizeTagKey(rawTag)
            if (!name || !key) {
                continue
            }
            if (!normalizedMap.has(key)) {
                normalizedMap.set(key, { name, key })
            }
        }
        const normalized = Array.from(normalizedMap.values())

        const existingTags = normalized.length
            ? await this.tagRepository.find({
                  where: { normalizedName: In(normalized.map(item => item.key)) },
              })
            : []
        const existingMap = new Map(existingTags.map(tag => [tag.normalizedName, tag]))

        const tagsToUse: TagEntity[] = []
        for (const item of normalized) {
            const existed = existingMap.get(item.key)
            if (existed) {
                tagsToUse.push(existed)
                continue
            }

            const creator = new UserEntity()
            creator.id = userId

            const tag = this.tagRepository.create({
                tagId: 'tag' + nanoid(6),
                name: item.name,
                normalizedName: item.key,
                createdBy: creator,
                updatedAt: new Date(),
            })
            const saved = await this.tagRepository.save(tag)
            tagsToUse.push(saved)
        }

        await this.pageTagRepository.delete({ page: { id: page.id } })
        if (tagsToUse.length > 0) {
            const records = tagsToUse.map(tag => {
                const relation = new PageTagEntity()
                relation.page = page
                relation.tag = tag
                return relation
            })
            await this.pageTagRepository.save(records)
        }

        await this.enqueueSearchIndex(page.id, 'tags_updated')
        return {
            pageId: page.pageId,
            tags: tagsToUse.map(tag => ({
                tagId: tag.tagId,
                name: tag.name,
            })),
        }
    }

    async listTags() {
        const tags = await this.tagRepository.find({
            order: { updatedAt: 'DESC' },
        })
        return tags.map(tag => ({
            tagId: tag.tagId,
            name: tag.name,
            normalizedName: tag.normalizedName,
        }))
    }

    async createTag(name: string, userId: number) {
        const normalizedName = normalizeTagName(name)
        const normalizedKey = normalizeTagKey(name)
        if (!normalizedName || !normalizedKey) {
            throw new NotFoundException('tag name is required')
        }

        const existing = await this.tagRepository.findOne({ where: { normalizedName: normalizedKey } })
        if (existing) {
            return existing
        }

        const creator = new UserEntity()
        creator.id = userId

        const tag = this.tagRepository.create({
            tagId: 'tag' + nanoid(6),
            name: normalizedName,
            normalizedName: normalizedKey,
            createdBy: creator,
            updatedAt: new Date(),
        })
        return this.tagRepository.save(tag)
    }

    async updateTag(tagId: string, name: string) {
        const tag = await this.tagRepository.findOne({ where: { tagId } })
        if (!tag) {
            throw new NotFoundException('tag not found')
        }
        const normalizedName = normalizeTagName(name)
        tag.name = normalizedName
        tag.normalizedName = normalizeTagKey(name)
        tag.updatedAt = new Date()
        return this.tagRepository.save(tag)
    }

    async deleteTag(tagId: string) {
        const tag = await this.tagRepository.findOne({ where: { tagId } })
        if (!tag) {
            throw new NotFoundException('tag not found')
        }
        await this.pageTagRepository.delete({ tag: { id: tag.id } })
        await this.tagRepository.delete({ id: tag.id })
        return { tagId }
    }

    async listPageTags(pageId: string, userId: number) {
        await this.pageAccessService.assertAction(pageId, userId, 'read', { includeDeleted: true })
        const relations = await this.pageTagRepository.find({
            where: { page: { pageId } },
            relations: ['tag'],
        })
        return relations
            .map(item => item.tag)
            .filter(Boolean)
            .map(tag => ({
                tagId: tag.tagId,
                name: tag.name,
            }))
    }

    async processPendingSearchJobs(limit = 50) {
        const jobs = await this.searchIndexJobRepository.find({
            where: { processedAt: null },
            order: { createdAt: 'ASC' },
            take: limit,
            relations: ['page'],
        })

        for (const job of jobs) {
            const page = await this.pageRepository.findOne({
                where: { id: job.page.id },
            })

            if (!page || page.deletedAt) {
                await this.pageSearchIndexRepository.delete({ page: { id: job.page.id } })
                job.processedAt = new Date()
                await this.searchIndexJobRepository.save(job)
                continue
            }

            const ydoc = await this.yjsPostgresqlAdapter.getYDoc(roomNameByPageId(page.pageId))
            const xml = ydoc.getXmlFragment(yFragmentNameByPageId(page.pageId)).toJSON()
            const bodyText = typeof xml === 'string' ? stripXmlTags(xml) : ''

            const pageTags = await this.pageTagRepository.find({
                where: { page: { id: page.id } },
                relations: ['tag'],
            })
            const tagsText = pageTags
                .map(item => item.tag?.name ?? '')
                .filter(Boolean)
                .join(' ')

            const existing = await this.pageSearchIndexRepository.findOne({
                where: { page: { id: page.id } },
                relations: ['page'],
            })
            if (existing) {
                existing.title = page.title
                existing.bodyText = bodyText
                existing.tagsText = tagsText
                existing.updatedAt = new Date()
                await this.pageSearchIndexRepository.save(existing)
            } else {
                const index = this.pageSearchIndexRepository.create({
                    page,
                    title: page.title,
                    bodyText,
                    tagsText,
                    updatedAt: new Date(),
                })
                await this.pageSearchIndexRepository.save(index)
            }

            job.processedAt = new Date()
            await this.searchIndexJobRepository.save(job)
        }

        return { processed: jobs.length }
    }

    async searchPages(payload: { userId: number; q?: string; tagId?: string; cursor?: string; limit?: number }) {
        const q = (payload.q ?? '').trim()
        const limit = Math.min(Math.max(Number(payload.limit ?? 20), 1), 50)

        const qb = this.pageSearchIndexRepository
            .createQueryBuilder('idx')
            .innerJoinAndSelect('idx.page', 'page')
            .innerJoin(PageMemberEntity, 'member', 'member.pageId = page.id AND member.userId = :userId', { userId: payload.userId })
            .where('page.deletedAt IS NULL')

        if (payload.tagId) {
            qb.innerJoin(PageTagEntity, 'pageTag', 'pageTag.pageId = page.id').innerJoin(
                TagEntity,
                'tag',
                'tag.id = pageTag.tagId AND tag.tagId = :tagId',
                {
                    tagId: payload.tagId,
                }
            )
        }

        if (payload.cursor) {
            qb.andWhere('idx.updatedAt < :cursor', { cursor: payload.cursor })
        }

        if (q) {
            qb.andWhere(
                `to_tsvector('simple', coalesce(idx.title,'') || ' ' || coalesce(idx.bodyText,'') || ' ' || coalesce(idx.tagsText,'')) @@ plainto_tsquery('simple', :q)`,
                { q }
            )
            qb.addSelect(
                `ts_rank(to_tsvector('simple', coalesce(idx.title,'') || ' ' || coalesce(idx.bodyText,'') || ' ' || coalesce(idx.tagsText,'')), plainto_tsquery('simple', :q))`,
                'rank'
            )
            qb.orderBy('rank', 'DESC')
        }

        qb.addOrderBy('idx.updatedAt', 'DESC')
            .addOrderBy('page.createdAt', 'DESC')
            .take(limit + 1)

        const rows = await qb.getRawAndEntities()
        const hasNext = rows.entities.length > limit
        const items = rows.entities.slice(0, limit).map(item => ({
            pageId: item.page.pageId,
            title: item.title,
            updatedAt: item.updatedAt,
        }))

        return {
            items,
            nextCursor: hasNext ? (items[items.length - 1]?.updatedAt ?? null) : null,
        }
    }

    async cleanupExpiredData() {
        await this.pageSnapshotRepository
            .createQueryBuilder()
            .delete()
            .where('"expireAt" IS NOT NULL')
            .andWhere('"expireAt" < :now', { now: new Date().toISOString() })
            .execute()

        const expiredPages = await this.pageRepository
            .createQueryBuilder('page')
            .where('"deletedAt" IS NOT NULL')
            .andWhere('"deletedAt" < :threshold', {
                threshold: new Date(Date.now() - DEFAULT_RETENTION_DAYS * DAY_MS).toISOString(),
            })
            .getMany()

        for (const page of expiredPages) {
            await this.yjsPostgresqlAdapter.clearDocument(roomNameByPageId(page.pageId))
            await this.pageRepository.delete({ id: page.id })
        }
    }
}
