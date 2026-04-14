import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { NotificationService } from './notification.service'

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    async list(@Request() req: { user: { id: number } }) {
        const data = await this.notificationService.list(req.user.id)
        return { data, success: true }
    }

    @Patch(':id/read')
    async markRead(@Param() params: { id: string }, @Request() req: { user: { id: number } }) {
        const data = await this.notificationService.markRead(params.id, req.user.id)
        return { data, success: true }
    }

    @Patch('read-all')
    async readAll(@Request() req: { user: { id: number } }) {
        const data = await this.notificationService.markAllRead(req.user.id)
        return { data, success: true }
    }
}
