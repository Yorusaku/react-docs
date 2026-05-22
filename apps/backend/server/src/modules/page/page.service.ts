import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { Repository } from 'typeorm'
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
import { AuditService } from '../audit/audit.service'
import { GovernanceService } from '../governance/governance.service'
import { PageAccessService } from './page-access.service'
import { DocOperation, DocRole, isDocOperation, isDocRole } from './page-acl.constants'

const roomNameByPageId = (pageId: string) => `doc-yjs/miaoma-doc-` + pageId
const yFragmentNameByPageId = (pageId: string) => `document-store-` + pageId
const DAY_MS = 24 * 60 * 60 * 1000

const sanitizeTitle = (title: string) =>
    Array.from(title).filter(char => { const code = char.charCodeAt(0); return code > 31 && code !== 127 }).join('').trim().slice(0, 255)

const normalizeTagName = (tag: string) => tag.trim().slice(0, 80)
const normalizeTagKey = (tag: string) => normalizeTagName(tag).toLowerCase()
const stripXmlTags = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

@Injectable()
export class PageService {
    constructor(
        @InjectRepository(PageEntity) private readonly pageRepository: Repository<PageEntity>,
        @InjectRepository(PageMemberEntity) private readonly pageMemberRepository: Repository<PageMemberEntity>,
        @InjectRepository(PageSnapshotEntity) private readonly pageSnapshotRepository: Repository<PageSnapshotEntity>,
        @InjectRepository(TagEntity) private readonly tagRepository: Repository<TagEntity>,
        @InjectRepository(PageTagEntity) private readonly pageTagRepository: Repository<PageTagEntity>,
        @InjectRepository(SearchIndexJobEntity) private readonly searchIndexJobRepository: Repository<SearchIndexJobEntity>,
        @InjectRepository(PageSearchIndexEntity) private readonly pageSearchIndexRepository: Repository<PageSearchIndexEntity>,
        private readonly pageAccessService: PageAccessService,
        private readonly governanceService: GovernanceService,
        private readonly auditService: AuditService,
        @Inject('YJS_POSTGRESQL_ADAPTER') private readonly yjsPostgresqlAdapter: PostgresqlPersistence
    ) {}

    private async createExpireAt() {
        const policy = await this.governanceService.getRetentionPolicy()
        return new Date(Date.now() + policy.snapshotDays * DAY_MS)
    }

    private normalizeOperations(operations: string[]) { const deduped = Array.from(new Set(operations.filter(isDocOperation))); return deduped as DocOperation[] }
    private ensureRole(role: string): DocRole { return isDocRole(role) ? role : 'viewer' }
    private async enqueueSearchIndex(pageId: number, reason: string) {
        const page = new PageEntity()
        page.id = pageId
        const job = this.searchIndexJobRepository.create({ page, reason, processedAt: null })
        await this.searchIndexJobRepository.save(job)
    }

    private async collectLinks(pageId: string) {
        const docName = roomNameByPageId(pageId)
        const ydoc = await this.yjsPostgresqlAdapter.getYDoc(docName)
        const xml = ydoc.getXmlFragment(yFragmentNameByPageId(pageId)).toJSON()
        let rawLinks: unknown[] = []
        if (typeof xml === 'string' && xml.length > 0) {
            try { rawLinks = yjsXmlMentionCollect(xml) } catch { rawLinks = [] }
        }
        return rawLinks.filter((item): item is string => typeof item === 'string' && item.length > 0)
    }

    private async encodeCurrentDocUpdate(pageId: string) {
        const docName = roomNameByPageId(pageId)
        const ydoc = await this.yjsPostgresqlAdapter.getYDoc(docName)
        const update = Y.encodeStateAsUpdate(ydoc)
        return Buffer.from(update).toString('base64')
    }

    private async createSnapshotInternal(payload: { page: PageEntity; createdById?: number; title?: string; reason: 'manual' | 'before_restore' }) {
        const updateBase64 = await this.encodeCurrentDocUpdate(payload.page.pageId)
        const snapshot = this.pageSnapshotRepository.create({
            snapshotId: 'snapshot' + nanoid(8),
            page: payload.page,
            createdBy: payload.createdById ? (() => { const u = new UserEntity(); u.id = payload.createdById; return u })() : null,
            title: payload.title ?? payload.page.title,
            reason: payload.reason,
            documentUpdate: updateBase64,
            expireAt: await this.createExpireAt(),
        })
        return this.pageSnapshotRepository.save(snapshot)
    }

    async create(page: PageEntity, userId: number) {
        const saved = await this.pageRepository.save(page)
        await this.pageAccessService.createOwnerMember(saved, userId)
        await this.enqueueSearchIndex(saved.id, 'page_created')
        await this.auditService.emit({ type: 'page_create', summary: saved.title, actorUserId: userId, targetType: 'page', targetId: saved.pageId })
        return saved
    }

    async list(payload: { userId: number }) {
        const members = await this.pageMemberRepository.find({
            where: { user: { id: payload.userId } },
            relations: ['page'],
            order: { id: 'ASC' },
        })
        const pages = members
            .map(m => m.page)
            .filter(p => p && !p.deletedAt)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        const unique = pages.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
        let count = unique.length
        return { pages: unique, count }
    }

    async softDelete(payload: { pageId: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'delete')
        page.deletedAt = new Date()
        const saved = await this.pageRepository.save(page)
        await this.auditService.emit({ type: 'page_delete', summary: page.title, actorUserId: payload.userId, targetType: 'page', targetId: page.pageId })
        return saved
    }

    async restore(payload: { pageId: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'restore', { includeDeleted: true })
        page.deletedAt = null
        page.updatedAt = new Date()
        const saved = await this.pageRepository.save(page)
        await this.enqueueSearchIndex(saved.id, 'page_restored')
        await this.auditService.emit({ type: 'page_restore', summary: page.title, actorUserId: payload.userId, targetType: 'page', targetId: page.pageId })
        return saved
    }

    async update(payload: { pageId: string; title?: string; emoji?: string; description?: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'write')
        if (payload.title !== undefined) page.title = sanitizeTitle(payload.title)
        if (payload.emoji !== undefined) page.emoji = payload.emoji.slice(0, 10)
        if (payload.description !== undefined) page.description = payload.description ?? null
        page.updatedAt = new Date()
        const saved = await this.pageRepository.save(page)
        await this.enqueueSearchIndex(saved.id, 'title_updated')
        await this.auditService.emit({ type: 'page_update', summary: saved.title, actorUserId: payload.userId, targetType: 'page', targetId: saved.pageId })
        return saved
    }

    async setPageTags(payload: { pageId: string; tagNames: string[]; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'write')
        await this.pageTagRepository.delete({ page: { id: page.id } })
        if (payload.tagNames.length === 0) return []
        const tags: TagEntity[] = []
        for (const name of payload.tagNames) {
            const normalized = normalizeTagName(name)
            if (!normalized) continue
            const key = normalizeTagKey(name)
            let tag = await this.tagRepository.findOne({ where: { normalizedName: key } })
            if (!tag) {
                tag = this.tagRepository.create({ tagId: 'tag_' + nanoid(8), name: normalized, normalizedName: key, createdBy: (() => { const u = new UserEntity(); u.id = payload.userId; return u })() })
                tag = await this.tagRepository.save(tag)
            }
            const pageTag = this.pageTagRepository.create({ page, tag })
            await this.pageTagRepository.save(pageTag)
            tags.push(tag)
        }
        await this.enqueueSearchIndex(page.id, 'tags_changed')
        return tags.map(t => ({ tagId: t.tagId, name: t.name, normalizedName: t.normalizedName }))
    }

    async getPageTags(pageId: string) {
        const pageTags = await this.pageTagRepository.find({ where: { page: { pageId } }, relations: ['tag'] })
        return pageTags.map(pt => ({ tagId: pt.tag.tagId, name: pt.tag.name, normalizedName: pt.tag.normalizedName }))
    }

    async getAllTags(userId: number) {
        const tags = await this.tagRepository.find({ order: { name: 'ASC' } })
        return tags.map(t => ({ tagId: t.tagId, name: t.name, normalizedName: t.normalizedName }))
    }

    async removePageTag(pageId: string, tagId: string, userId: number) {
        await this.pageAccessService.assertAction(pageId, userId, 'write')
        await this.pageTagRepository.delete({ page: { pageId }, tag: { tagId } })
        const page = await this.pageAccessService.findPageByPageId(pageId)
        await this.enqueueSearchIndex(page.id, 'tag_removed')
    }

    async getPageGraph() {
        const pages = await this.pageRepository.find({ where: { deletedAt: null as any }, relations: ['pageId'] as any })
        const result: any[] = []
        for (const page of pages) {
            const links = await this.collectLinks(page.pageId)
            result.push({ ...page, links })
        }
        return result
    }

    async listSnapshots(pageId: string) {
        const snapshots = await this.pageSnapshotRepository.find({
            where: { page: { pageId } },
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        })
        return snapshots.map(s => ({
            snapshotId: s.snapshotId,
            title: s.title,
            reason: s.reason,
            createdAt: s.createdAt.toISOString(),
            expireAt: s.expireAt ? s.expireAt.toISOString() : null,
            createdBy: s.createdBy ? { id: s.createdBy.id, username: s.createdBy.username } : null,
        }))
    }

    async createSnapshot(payload: { pageId: string; userId: number; title?: string }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'write')
        const snapshot = await this.createSnapshotInternal({ page, createdById: payload.userId, title: payload.title, reason: 'manual' })
        await this.auditService.emit({ type: 'snapshot_create', summary: page.title, actorUserId: payload.userId, targetType: 'page', targetId: page.pageId })
        return {
            snapshotId: snapshot.snapshotId,
            title: snapshot.title,
            reason: snapshot.reason,
            createdAt: snapshot.createdAt.toISOString(),
            expireAt: snapshot.expireAt ? snapshot.expireAt.toISOString() : null,
            createdBy: snapshot.createdBy ? { id: snapshot.createdBy.id, username: snapshot.createdBy.username } : null,
        }
    }

    async restoreSnapshot(payload: { pageId: string; snapshotId: string; userId: number }) {
        const { page } = await this.pageAccessService.assertAction(payload.pageId, payload.userId, 'restore')
        const snapshot = await this.pageSnapshotRepository.findOne({
            where: { snapshotId: payload.snapshotId, page: { pageId: payload.pageId } },
        })
        if (!snapshot) throw new NotFoundException('snapshot not found')

        await this.createSnapshotInternal({ page, createdById: payload.userId, title: page.title + ' (before_restore)', reason: 'before_restore' })

        const update = Buffer.from(snapshot.documentUpdate, 'base64')
        const docName = roomNameByPageId(page.pageId)
        await this.yjsPostgresqlAdapter.setDocumentUpdate(docName, update)

        await this.enqueueSearchIndex(page.id, 'snapshot_restored')
        await this.auditService.emit({ type: 'snapshot_restore', summary: page.title, actorUserId: payload.userId, targetType: 'page', targetId: page.pageId })
    }

    async processPendingSearchJobs(limit: number) {
        const jobs = await this.searchIndexJobRepository.find({
            where: { processedAt: null as any },
            order: { createdAt: 'ASC' },
            take: limit,
            relations: ['page'],
        })
        for (const job of jobs) {
            const page = await this.pageRepository.findOne({ where: { id: job.page.id } })
            if (!page || page.deletedAt) {
                await this.pageSearchIndexRepository.delete({ page: { id: job.page.id } })
                job.processedAt = new Date()
                await this.searchIndexJobRepository.save(job)
                continue
            }
            const ydoc = await this.yjsPostgresqlAdapter.getYDoc(roomNameByPageId(page.pageId))
            const xml = ydoc.getXmlFragment(yFragmentNameByPageId(page.pageId)).toJSON()
            const bodyText = typeof xml === 'string' ? stripXmlTags(xml) : ''
            const pageTags = await this.pageTagRepository.find({ where: { page: { id: page.id } }, relations: ['tag'] })
            const tagsText = pageTags.map(item => item.tag?.name ?? '').filter(Boolean).join(' ')
            const existing = await this.pageSearchIndexRepository.findOne({ where: { page: { id: page.id } }, relations: ['page'] })
            if (existing) { existing.title = page.title; existing.bodyText = bodyText; existing.tagsText = tagsText; existing.updatedAt = new Date(); await this.pageSearchIndexRepository.save(existing) }
            else { const index = this.pageSearchIndexRepository.create({ page, title: page.title, bodyText, tagsText, updatedAt: new Date() }); await this.pageSearchIndexRepository.save(index) }
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
        if (payload.tagId) { qb.innerJoin(PageTagEntity, 'pageTag', 'pageTag.pageId = page.id').innerJoin(TagEntity, 'tag', 'tag.id = pageTag.tagId AND tag.tagId = :tagId', { tagId: payload.tagId }) }
        if (payload.cursor) { qb.andWhere('idx.updatedAt < :cursor', { cursor: payload.cursor }) }
        if (q) {
            qb.andWhere(`to_tsvector('simple', coalesce(idx.title,'''') || ' ' || coalesce(idx.bodyText,'''') || ' ' || coalesce(idx.tagsText,'''')) @@ plainto_tsquery('simple', :q)`, { q })
            qb.addSelect(`ts_rank(to_tsvector('simple', coalesce(idx.title,'''') || ' ' || coalesce(idx.bodyText,'''') || ' ' || coalesce(idx.tagsText,'''')), plainto_tsquery('simple', :q))`, 'rank')
            qb.orderBy('rank', 'DESC')
        }
        qb.addOrderBy('idx.updatedAt', 'DESC').addOrderBy('page.createdAt', 'DESC').take(limit + 1)
        const rows = await qb.getRawAndEntities()
        const hasNext = rows.entities.length > limit
        const items = rows.entities.slice(0, limit).map(item => ({ pageId: item.page.pageId, title: item.title, updatedAt: item.updatedAt }))
        return { items, nextCursor: hasNext ? (items[items.length - 1]?.updatedAt ?? null) : null }
    }

    async cleanupExpiredData(snapshotDays: number, trashDays: number) {
        await this.pageSnapshotRepository
            .createQueryBuilder()
            .delete()
            .where('"expireAt" IS NOT NULL')
            .andWhere('"expireAt" < :now', { now: new Date().toISOString() })
            .execute()

        const expiredPages = await this.pageRepository
            .createQueryBuilder('page')
            .where('"deletedAt" IS NOT NULL')
            .andWhere('"deletedAt" < :threshold', { threshold: new Date(Date.now() - trashDays * DAY_MS).toISOString() })
            .getMany()

        for (const page of expiredPages) {
            await this.yjsPostgresqlAdapter.clearDocument(roomNameByPageId(page.pageId))
            await this.pageRepository.delete({ id: page.id })
        }
    }
}
