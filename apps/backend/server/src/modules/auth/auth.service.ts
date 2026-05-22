import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { AuditService } from '../audit/audit.service'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly auditService: AuditService,
    ) {}

    async validateUser(username: string, pass: string) {
        const user = await this.userService.validateUser(username, pass)
        if (!user) return null
        const result = { ...user }
        delete result.password
        return result
    }

    async login(user: { username: string; id?: number; userId?: number }) {
        const sub = user.userId ?? user.id
        if (!sub) throw new UnauthorizedException('invalid user payload')

        await this.auditService.emit({
            type: 'login', summary: user.username + ' 登录', actorUserId: sub, targetType: 'auth', targetId: String(sub),
        })

        const payload = { username: user.username, sub }
        return { access_token: this.jwtService.sign(payload) }
    }

    async logout(user?: { userId?: number; id?: number; username?: string }) {
        const sub = user?.userId ?? user?.id
        if (sub) {
            await this.auditService.emit({
                type: 'logout', summary: '用户登出', actorUserId: sub, targetType: 'auth', targetId: String(sub),
            })
        }
        return true
    }
}
