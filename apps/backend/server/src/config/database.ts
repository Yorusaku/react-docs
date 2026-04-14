import { join } from 'node:path'

export default () => {
    const host = process.env.PG_HOST ?? 'localhost'
    const port = Number(process.env.PG_PORT ?? 5432)
    const username = process.env.PG_USER ?? 'postgres'
    const database = process.env.PG_DATABASE ?? 'postgres'
    const password = process.env.PG_PASSWORD ?? ''

    return {
        database: {
            type: 'postgres',
            host,
            port,
            username,
            database,
            password,
            entities: [join(__dirname, '../', '**/**.entity{.ts,.js}')],
            migrations: [join(__dirname, '../', 'migrations/*{.ts,.js}')],
            synchronize: false,
        },
    }
}
