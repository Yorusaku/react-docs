import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { GovernanceRetentionPolicyEntity } from '../../../entities/governance-retention-policy.entity'

@Injectable()
export class GovernanceService {
    constructor(
        @InjectRepository(GovernanceRetentionPolicyEntity)
        private readonly policyRepo: Repository<GovernanceRetentionPolicyEntity>,
    ) {}

    private async ensureRow(): Promise<GovernanceRetentionPolicyEntity> {
        const rows = await this.policyRepo.find({ take: 1 })
        if (rows.length > 0) return rows[0]

        const created = this.policyRepo.create({ snapshotDays: 30, trashDays: 30, auditDays: 90 })
        return this.policyRepo.save(created)
    }

    async getRetentionPolicy() {
        const policy = await this.ensureRow()
        return { snapshotDays: policy.snapshotDays, trashDays: policy.trashDays, auditDays: policy.auditDays }
    }

    async updateRetentionPolicy(payload: { snapshotDays?: number; trashDays?: number; auditDays?: number }) {
        const policy = await this.ensureRow()
        if (payload.snapshotDays !== undefined) policy.snapshotDays = Math.max(1, Math.floor(payload.snapshotDays))
        if (payload.trashDays !== undefined) policy.trashDays = Math.max(1, Math.floor(payload.trashDays))
        if (payload.auditDays !== undefined) policy.auditDays = Math.max(1, Math.floor(payload.auditDays))
        policy.updatedAt = new Date()
        const saved = await this.policyRepo.save(policy)
        return { snapshotDays: saved.snapshotDays, trashDays: saved.trashDays, auditDays: saved.auditDays }
    }
}
