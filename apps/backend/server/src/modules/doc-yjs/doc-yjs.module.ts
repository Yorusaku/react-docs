import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { jwtConstants } from '../auth/constants'
import { UserModule } from '../user/user.module'
import { DocYjsGateway } from './doc-yjs.gateway'

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1 days' },
        }),
    ],
    providers: [DocYjsGateway],
})
export class DocYjsModule {}
