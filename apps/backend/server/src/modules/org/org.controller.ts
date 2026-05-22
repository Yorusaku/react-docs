import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { OrgService } from './org.service'

@Controller('org')
@UseGuards(AuthGuard('jwt'))
export class OrgController {
    constructor(private readonly orgService: OrgService) {}

    @Get('mappings')
    async getMappings() {
        const data = await this.orgService.getMappings()
        return { success: true as const, data }
    }

    @Put('mappings')
    async updateMapping(@Body() body: { userId: number; departmentId?: string; position?: string }) {
        await this.orgService.updateMapping({ userId: Number(body.userId), departmentId: body.departmentId, position: body.position })
        const data = await this.orgService.getMappings()
        return { success: true as const, data }
    }
}
