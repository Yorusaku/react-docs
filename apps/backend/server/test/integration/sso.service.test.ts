import { JwtModule } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AuditEventEntity } from '../../src/entities/audit-event.entity'
import { SsoSimulationCodeEntity, SsoSimulationSessionEntity } from '../../src/entities/sso-simulation.entity'
import { UserEntity } from '../../src/entities/user.entity'
import { AuditService } from '../../src/modules/audit/audit.service'
import { jwtConstants } from '../../src/modules/auth/constants'
import { SsoService } from '../../src/modules/sso/sso.service'
import { integrationTypeOrmOptions, resetIntegrationTables } from './support/test-database'

describe('SsoService Integration', () => {
    let module: TestingModule
    let ssoService: SsoService

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot(integrationTypeOrmOptions()),
                TypeOrmModule.forFeature([SsoSimulationCodeEntity, SsoSimulationSessionEntity, UserEntity, AuditEventEntity]),
                JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '1 days' } }),
            ],
            providers: [SsoService, AuditService],
        }).compile()

        ssoService = module.get(SsoService)
        await resetIntegrationTables(module.get(DataSource), ['sso_simulation_code', 'sso_simulation_session', 'audit_event', 'user'])
    })

    afterAll(async () => {
        await module?.close()
    })

    describe('getProviders', () => {
        it('返回 wechat-work 和 dingtalk', async () => {
            const providers = await ssoService.getProviders()
            expect(providers.length).toBe(2)
            expect(providers.find((p: any) => p.key === 'wechat-work')).toBeTruthy()
            expect(providers.find((p: any) => p.key === 'dingtalk')).toBeTruthy()
        })
    })

    describe('simulate', () => {
        it('start 返回 code + authorizeUrl', async () => {
            const result = await ssoService.simulateStart('wechat-work')
            expect(result.code).toBeTruthy()
            expect(result.authorizeUrl).toBeTruthy()
        })

        it('callback 返回 access_token + user（新用户自动创建）', async () => {
            const start = await ssoService.simulateStart('dingtalk')
            const result = await ssoService.simulateCallback('dingtalk', start.code)
            expect(result.access_token).toBeTruthy()
            expect(result.user).toBeTruthy()
            expect(result.user.username).toBeTruthy()
        })

        it('callback 对于已存在用户直接返回', async () => {
            const start = await ssoService.simulateStart('wechat-work')
            const r1 = await ssoService.simulateCallback('wechat-work', start.code)
            // 同一用户再次 callback 应返回相同 access_token
            expect(r1.access_token).toBeTruthy()
        })

        it('无效 code 抛出错误', async () => {
            await expect(ssoService.simulateCallback('wechat-work', 'bad-code')).rejects.toThrow()
        })

        it('未知 provider 抛出错误', async () => {
            await expect(ssoService.simulateStart('unknown-provider' as any)).rejects.toThrow()
        })
    })
})
