import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { SsoService } from './sso.service'

@Controller('sso')
@UseGuards(AuthGuard('jwt'))
export class SsoController {
    constructor(private readonly ssoService: SsoService) {}

    @Get('providers')
    async getProviders() {
        const data = await this.ssoService.getProviders()
        return { success: true as const, data }
    }

    @Post('simulate/start')
    async simulateStart(@Body() body: { provider: string }) {
        const data = await this.ssoService.simulateStart(body.provider)
        return { success: true as const, data }
    }

    @Post('simulate/callback')
    async simulateCallback(@Body() body: { provider: string; code: string }) {
        const data = await this.ssoService.simulateCallback(body.provider, body.code)
        return { success: true as const, data }
    }
}
