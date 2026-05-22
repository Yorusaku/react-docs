import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { ObservabilityDashboardService } from './observability-dashboard.service'

@Controller('observability')
@UseGuards(AuthGuard('jwt'))
export class ObservabilityController {
    constructor(private readonly observabilityService: ObservabilityDashboardService) {}

    @Get('dashboard')
    async getDashboard() {
        const data = await this.observabilityService.getDashboard()
        return { success: true as const, data }
    }
}
