import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { PageService } from '../page/page.service'

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
    constructor(private readonly pageService: PageService) {}

    @Get('pages')
    async search(
        @Query() query: { q?: string; tagId?: string; cursor?: string; limit?: string },
        @Request() req: { user: { id: number } }
    ) {
        await this.pageService.processPendingSearchJobs(30)
        const data = await this.pageService.searchPages({
            userId: req.user.id,
            q: query.q,
            tagId: query.tagId,
            cursor: query.cursor,
            limit: query.limit ? Number(query.limit) : undefined,
        })
        return { data, success: true }
    }
}
