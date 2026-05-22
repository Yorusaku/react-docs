import { join } from 'node:path'

import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { UserEntity } from '../../src/entities/user.entity'
import { OrgService } from '../../src/modules/org/org.service'

describe('OrgService (RED)', () => {
    let module: TestingModule
    let ds: DataSource
    let orgService: OrgService
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
            providers: [OrgService],
        }).compile()

        ds = module.get(DataSource)
        orgService = module.get(OrgService)
        userRepo = ds.getRepository(UserEntity)
    })

    afterAll(async () => { await module?.close() })

    describe('getMappings', () => {
        it('返回 departments + roleMappings + users', async () => {
            const mappings = await orgService.getMappings()
            expect(mappings.departments).toBeTruthy()
            expect(mappings.roleMappings).toBeTruthy()
            expect(mappings.users).toBeTruthy()
        })

        it('departments 每项含 id + name', async () => {
            const mappings = await orgService.getMappings()
            if (mappings.departments.length > 0) {
                expect(mappings.departments[0].id).toBeTruthy()
                expect(mappings.departments[0].name).toBeTruthy()
            }
        })

        it('roleMappings 每项含 position + defaultRole（合法 DocRole）', async () => {
            const mappings = await orgService.getMappings()
            mappings.roleMappings.forEach((rm: any) => {
                expect(rm.position).toBeTruthy()
                expect(['owner', 'editor', 'commenter', 'viewer']).toContain(rm.defaultRole)
            })
        })
    })

    describe('updateMapping', () => {
        it('更新用户部门', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'org1', password: 'h' }))
            await orgService.updateMapping({ userId: user.id, departmentId: 'dept-eng' })

            const mappings = await orgService.getMappings()
            const updated = mappings.users.find((u: any) => u.userId === user.id)
            expect(updated).toBeTruthy()
            expect(updated!.departmentId).toBe('dept-eng')
        })

        it('更新用户职位', async () => {
            const user = await userRepo.save(userRepo.create({ username: 'org2', password: 'h' }))
            await orgService.updateMapping({ userId: user.id, position: 'manager' })

            const mappings = await orgService.getMappings()
            const updated = mappings.users.find((u: any) => u.userId === user.id)
            expect(updated).toBeTruthy()
            expect(updated!.position).toBe('manager')
        })

        it('更新不存在的用户抛出 NotFound', async () => {
            await expect(orgService.updateMapping({ userId: 99999, departmentId: 'x' })).rejects.toThrow()
        })
    })
})
