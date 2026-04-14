import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { PostgresqlPersistence } from 'y-postgresql'
import * as Y from 'yjs'

import { setPersistence } from './utils'

export interface YjsPostgresqlOptions {
    host: string
    port: number
    user: string
    database: string
    password: string
    table: {
        name: string
        useIndex: boolean
        flushSize: number
    }
}

@Global()
@Module({})
export class YjsPostgresqlModule {
    static forRoot(options?: YjsPostgresqlOptions): DynamicModule {
        return {
            module: YjsPostgresqlModule,
            providers: [
                {
                    provide: 'YJS_POSTGRESQL_ADAPTER',
                    useFactory: async () => {
                        const host = options?.host ?? process.env.PG_HOST ?? 'localhost'
                        const port = options?.port ?? Number(process.env.PG_PORT ?? 5432)
                        const user = options?.user ?? process.env.PG_USER ?? 'postgres'
                        const database = options?.database ?? process.env.PG_DATABASE ?? 'postgres'
                        const password = options?.password ?? process.env.PG_PASSWORD ?? ''
                        const tableName = options?.table?.name ?? 'yjs-writings'
                        const useIndex = options?.table?.useIndex ?? false
                        const flushSize = options?.table?.flushSize ?? 200

                        Logger.log(`yjs-postgresql connected: host=${host} db=${database} table=${tableName}`)

                        const pgdb = await PostgresqlPersistence.build(
                            {
                                host,
                                port,
                                user,
                                database,
                                password,
                            },
                            { tableName, useIndex, flushSize }
                        )

                        setPersistence({
                            bindState: async (docName, ydoc) => {
                                const persistedYdoc = await pgdb.getYDoc(docName)
                                const newUpdates = Y.encodeStateAsUpdate(ydoc)
                                await pgdb.storeUpdate(docName, newUpdates)
                                Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
                                ydoc.on('update', async (update: Uint8Array) => {
                                    await pgdb.storeUpdate(docName, update)
                                })
                            },
                            writeState: async () => true,
                        })

                        return pgdb
                    },
                },
            ],
            exports: ['YJS_POSTGRESQL_ADAPTER'],
        }
    }
}
