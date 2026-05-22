import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

// SSO 模拟验证码（企业微信/钉钉模拟闭环）
@Entity({ name: 'sso_simulation_code' })
export class SsoSimulationCodeEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 128, unique: true })
    code: string

    @Column({ type: 'varchar', length: 50 })
    provider: string

    @Column({ type: 'varchar', length: 255 })
    simulatedUserId: string

    @Index()
    @Column({ type: 'timestamp' })
    expiresAt: Date

    @Column({ type: 'boolean', default: false })
    used: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}

// SSO 登录会话
@Entity({ name: 'sso_simulation_session' })
export class SsoSimulationSessionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 128 })
    sessionId: string

    @Column({ type: 'integer' })
    userId: number

    @Column({ type: 'varchar', length: 50 })
    provider: string

    @Index()
    @Column({ type: 'timestamp' })
    expiresAt: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}
