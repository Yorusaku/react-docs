import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PageEntity } from '../../entities/page.entity'
import { PageMemberEntity } from '../../entities/page-member.entity'
import { PageSearchIndexEntity } from '../../entities/page-search-index.entity'
import { PageSnapshotEntity } from '../../entities/page-snapshot.entity'
import { PageTagEntity } from '../../entities/page-tag.entity'
import { SearchIndexJobEntity } from '../../entities/search-index-job.entity'
import { TagEntity } from '../../entities/tag.entity'
import { PageController } from './page.controller'
import { PageService } from './page.service'
import { PageAccessService } from './page-access.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PageEntity,
            PageMemberEntity,
            PageSnapshotEntity,
            TagEntity,
            PageTagEntity,
            SearchIndexJobEntity,
            PageSearchIndexEntity,
        ]),
    ],
    controllers: [PageController],
    providers: [PageService, PageAccessService],
    exports: [PageService, PageAccessService],
})
export class PageModule {}
