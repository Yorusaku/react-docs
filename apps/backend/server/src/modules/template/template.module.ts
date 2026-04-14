import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TemplateEntity } from '../../entities/template.entity'
import { UserEntity } from '../../entities/user.entity'
import { PageModule } from '../page/page.module'
import { TemplateController } from './template.controller'
import { TemplateService } from './template.service'
import { TemplatePageController } from './template-page.controller'

@Module({
    imports: [TypeOrmModule.forFeature([TemplateEntity, UserEntity]), PageModule],
    controllers: [TemplateController, TemplatePageController],
    providers: [TemplateService],
    exports: [TemplateService],
})
export class TemplateModule {}
