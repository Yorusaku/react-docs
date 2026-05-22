import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { GovernanceService } from './governance.service'

@Controller('governance')
@UseGuards(AuthGuard('jwt'))
export class GovernanceController {
    constructor(private readonly governanceService: GovernanceService) {}

    @Get('retention')
    async getRetention() {
        const data = await this.governanceService.getRetentionPolicy()
        return { success: true as const, data }
    }

    @Put('retention')
    async updateRetention(@Body() body: any) {
        const data = await this.governanceService.updateRetentionPolicy({
            snapshotDays: body.snapshotDays !== undefined ? Number(body.snapshotDays) : undefined,
            trashDays: body.trashDays !== undefined ? Number(body.trashDays) : undefined,
            auditDays: body.auditDays !== undefined ? Number(body.auditDays) : undefined,
        })
        return { success: true as const, data }
    }
}
