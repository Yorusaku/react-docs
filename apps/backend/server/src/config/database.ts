/*
 * Copyright (c) 2024 Miaoma Academy @Heyi
 * All rights reserved.
 * Internal learning project. Not intended for open-source distribution.
 */
import { join } from 'node:path'

// This file only builds the TypeORM config object.
// The actual database connection is created later by TypeOrmModule.
export default () => {
    const isProd = process.env.NODE_ENV === 'production'

    // Local development should prefer env values first.
    const host = process.env.PG_HOST ?? (isProd ? '172.28.49.109' : 'localhost')
    const port = Number(process.env.PG_PORT ?? 5432)
    const username = process.env.PG_USER ?? 'postgres'
    const database = process.env.PG_DATABASE ?? 'postgres'
    const password = process.env.PG_PASSWORD ?? 'xiaoer'

    return {
        database: {
            type: 'postgres',
            host,
            port,
            username,
            database,
            password,
            // Auto-load all entity files for TypeORM.
            entities: [join(__dirname, '../', '**/**.entity{.ts,.js}')],
            // Convenient for learning and local development.
            synchronize: true,
        },
    }
}
