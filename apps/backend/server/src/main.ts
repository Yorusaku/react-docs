/*
 * Copyright (c) 2024 Miaoma Academy @Heyi
 * All rights reserved.
 * Internal learning project. Not intended for open-source distribution.
 */
import { NestFactory } from '@nestjs/core'
import { WsAdapter } from '@nestjs/platform-ws'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './fundamentals/common/filters/http-exception.filter'

// Backend bootstrap flow:
// 1. Create the Nest application from AppModule
// 2. Register global capabilities such as filters, ws adapter, and Swagger
// 3. Read the port and start listening
async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    // Normalize business errors into one response shape for the frontend.
    app.useGlobalFilters(new HttpExceptionFilter())

    // Collaborative editing uses raw WebSocket instead of socket.io.
    app.useWebSocketAdapter(new WsAdapter(app))

    // All HTTP routes become /api/*
    app.setGlobalPrefix('api')

    // Swagger documents the HTTP API only.
    const swaggerOptions = new DocumentBuilder()
        .setTitle('Miaoma Docs API')
        .setDescription('Miaoma Docs API')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, swaggerOptions)
    SwaggerModule.setup('doc', app, document)

    const port = Number(process.env.SERVER_PORT ?? process.env.PORT ?? 8082)
    await app.listen(port)
}

bootstrap()
