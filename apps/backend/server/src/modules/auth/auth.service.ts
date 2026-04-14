import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    async validateUser(username: string, pass: string) {
        const user = await this.userService.validateUser(username, pass)
        if (!user) {
            return null
        }

        const result = { ...user }
        delete result.password
        return result
    }

    async login(user: { username: string; id?: number; userId?: number }) {
        const sub = user.userId ?? user.id
        if (!sub) {
            throw new UnauthorizedException('invalid user payload')
        }

        const payload = { username: user.username, sub }
        return {
            access_token: this.jwtService.sign(payload),
        }
    }

    async logout() {
        return true
    }
}
