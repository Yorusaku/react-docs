import { Module } from '@nestjs/common'

import { PageModule } from '../page/page.module'
import { SearchController } from './search.controller'

@Module({
    imports: [PageModule],
    controllers: [SearchController],
})
export class SearchModule {}
