import { Injectable, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { nanoid } from 'nanoid'
import { Repository } from 'typeorm'

import { UserEntity } from '../../../entities/user.entity'
import { SsoSimulationCodeEntity } from '../../../entities/sso-simulation.entity'
import { AuditService } from '../../audit/audit.service'

const PROVIDERS = [
    { key: 'wechat-work' as const, name: '企业微信' },
    { key: 'dingtalk' as const, name: '钉钉' },
]


@Injectable()
export class SsoService {
    constructor(
        @InjectRepository(SsoSimulationCodeEntity)
        private readonly codeRepo: Repository<SsoSimulationCodeEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly auditService: AuditService,
    ) {}

    async getProviders() {
        return PROVIDERS
    }

    async simulateStart(provider: string) {
        if (!PROVIDERS.some(p => p.key === provider)) {
            throw new BadRequestException('unknown provider')
        }

        const code = 'sso_' + nanoid(24)
        const simulatedUserId = `${provider}_user_${nanoid(8)}`
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 分钟过期

        await this.codeRepo.save(this.codeRepo.create({
            code, provider, simulatedUserId, expiresAt, used: false,
        }))

        return {
            code,
            authorizeUrl: `/sso/simulate/authorize?provider=${provider}&code=${code}`,
        }
    }

    async simulateCallback(provider: string, code: string) {
        if (!PROVIDERS.some(p => p.key === provider)) {
            throw new BadRequestException('unknown provider')
        }

        const record = await this.codeRepo.findOne({ where: { code, provider } })
        if (!record || record.used || record.expiresAt < new Date()) {
            throw new BadRequestException('invalid or expired code')
        }

        record.used = true
        await this.codeRepo.save(record)

        const username = record.simulatedUserId
        let user = await this.userRepo.findOne({ where: { username } })
        if (!user) {
            user = await this.userRepo.save(this.userRepo.create({
                username,
                password: 'sso_simulated',
            }))
        }

        const token = this.jwtService.sign({ sub: user.id, username: user.username })

        await this.auditService.emit({
            type: 'sso_login',
            summary: `SSO 模拟登录: ${provider}`,
            actorUserId: user.id,
            targetType: 'sso',
            targetId: provider,
            meta: { provider, simulatedUserId: record.simulatedUserId },
        })

        return { access_token: token, user: { id: user.id, username: user.username } }
    }
}
