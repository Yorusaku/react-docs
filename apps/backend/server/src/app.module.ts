/*
 * Copyright (c) 2024 Miaoma Academy @Heyi
 * All rights reserved.
 * Internal learning project. Not intended for open-source distribution.
 */
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import databaseConfig from './config/database'
import { YjsPostgresqlModule } from './fundamentals/yjs-postgresql/yjs-postgresql.module'
import { ApplicationModule } from './modules/application/application.module'
import { AuthModule } from './modules/auth/auth.module'
// import { WSDemoModule } from './modules/ws-demo/ws-demo.module'
import { DocYjsModule } from './modules/doc-yjs/doc-yjs.module'
import { PageModule } from './modules/page/page.module'
import { UserModule } from './modules/user/user.module'

// AppModule is the root composition layer of the backend.
// It wires config, database, business modules, and collaboration modules together.
@Module({
    imports: [
        // Load env-based configuration first.
        ConfigModule.forRoot({ load: [databaseConfig] }),

        // Build the TypeORM connection from ConfigService at runtime.
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => {
                return config.get('database')
            },
            inject: [ConfigService],
        }),

        // HTTP auth and user modules.
        AuthModule,
        UserModule,

        // Main business modules.
        ApplicationModule,
        // WSDemoModule,
        DocYjsModule,
        PageModule,

        // Persistence layer for Yjs document updates.
        YjsPostgresqlModule.forRoot(),
    ],
    providers: [],
})
export class AppModule {}
