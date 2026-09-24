import { Module } from '@nestjs/common'

import { PageModule } from '../page/page.module'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'

@Module({
    imports: [PageModule],
    controllers: [AiController],
    providers: [AiService],
})
export class AiModule {}
