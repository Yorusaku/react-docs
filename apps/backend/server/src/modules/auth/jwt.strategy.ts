import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { UserService } from '../user/user.service'
import { jwtConstants } from './constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        })
    }

    async validate(payload: { sub?: number }) {
        if (!payload?.sub) {
            throw new UnauthorizedException('invalid token payload')
        }

        const user = await this.userService.findById(payload.sub)
        if (!user) {
            throw new UnauthorizedException('user not found')
        }

        const result = { ...user }
        delete result.password
        return result
    }
}
