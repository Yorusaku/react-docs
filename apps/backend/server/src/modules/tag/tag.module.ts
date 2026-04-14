import { Module } from '@nestjs/common'

import { PageModule } from '../page/page.module'
import { TagController } from './tag.controller'

@Module({
    imports: [PageModule],
    controllers: [TagController],
})
export class TagModule {}
