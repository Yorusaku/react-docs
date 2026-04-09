/*
 * Copyright (c) 2024 Miaoma Academy @Heyi
 * All rights reserved.
 * Internal learning project. Not intended for open-source distribution.
 */
import { Module } from '@nestjs/common'

import { DocYjsGateway } from './doc-yjs.gateway'

// Thin module that only registers the collaboration gateway.
@Module({
    imports: [],
    providers: [DocYjsGateway],
    exports: [],
})
export class DocYjsModule {}
