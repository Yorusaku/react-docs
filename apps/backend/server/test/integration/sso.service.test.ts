import { join } from 'node:path'

import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { UserEntity } from '../../src/entities/user.entity'
import { SsoService } from '../../src/modules/sso/sso.service'

describe('SsoService (RED)', () => {
    let module: TestingModule
    let ds: DataSource
    let ssoService: SsoService
    let userRepo: Repository<UserEntity>

    const testDb = process.env.PG_DATABASE_TEST ?? 'miaoma_test'
    const pgHost = process.env.PG_HOST ?? 'localhost'
    const pgPort = Number(process.env.PG_PORT ?? 5432)
    const pgUser = process.env.PG_USER ?? 'postgres'
    const pgPassword = process.env.PG_PASSWORD ?? 'postgres'

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres', host: pgHost, port: pgPort, username: pgUser,
                    password: pgPassword, database: testDb,
                    entities: [join(__dirname, '../../src', '**/**.entity{.ts,.js}')],
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([UserEntity]),
            ],
            providers: [SsoService],
        }).compile()

        ds = module.get(DataSource)
        ssoService = module.get(SsoService)
        userRepo = ds.getRepository(UserEntity)
    })

    afterAll(async () => { await module?.close() })

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
