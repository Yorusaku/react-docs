import { EventEmitter } from 'node:events'

import * as encoding from 'lib0/encoding'
import { afterEach, describe, expect, it } from 'vitest'
import * as syncProtocol from 'y-protocols/sync'
import * as Y from 'yjs'

import { docs, setupWSConnection } from '../src/fundamentals/yjs-postgresql/utils'

class TestConnection extends EventEmitter {
    readyState = 1
    sent: Uint8Array[] = []
    closeCode?: number
    binaryType = ''

    send(message: Uint8Array, callback?: (error?: Error) => void) {
        this.sent.push(message)
        callback?.()
    }

    close(code?: number) {
        if (this.readyState === 3) return
        this.closeCode = code
        this.readyState = 3
        this.emit('close')
    }

    ping() {}
}

const updateMessage = (text: string) => {
    const source = new Y.Doc()
    source.getText('body').insert(0, text)
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, 0)
    syncProtocol.writeUpdate(encoder, Y.encodeStateAsUpdate(source))
    source.destroy()
    return encoding.toUint8Array(encoder)
}

const settle = () => new Promise(resolve => setTimeout(resolve, 10))

describe('Yjs write ACL', () => {
    const connections: TestConnection[] = []
    afterEach(() => {
        connections.forEach(connection => connection.close())
        connections.length = 0
        docs.forEach((doc, key) => {
            doc.destroy()
            docs.delete(key)
        })
    })

    it('allows viewer sync requests but rejects raw updates without changing content', async () => {
        const room = `viewer-${Date.now()}`
        const owner = new TestConnection()
        const viewer = new TestConnection()
        connections.push(owner, viewer)
        setupWSConnection(owner, { url: `/${room}` }, { docName: room, canWrite: async () => true })
        owner.emit('message', updateMessage('original'))
        await settle()

        setupWSConnection(viewer, { url: `/${room}` }, { docName: room, canWrite: async () => false })
        const syncRequest = encoding.createEncoder()
        encoding.writeVarUint(syncRequest, 0)
        syncProtocol.writeSyncStep1(syncRequest, new Y.Doc())
        viewer.emit('message', encoding.toUint8Array(syncRequest))
        await settle()
        expect(viewer.sent.length).toBeGreaterThan(1)
        expect(viewer.closeCode).toBeUndefined()

        viewer.emit('message', updateMessage('forbidden'))
        await settle()
        expect(viewer.closeCode).toBe(4003)
        expect(docs.get(room)?.getText('body').toString()).toBe('original')
    })

    it('rechecks permission on each message from an existing connection', async () => {
        const room = `demoted-${Date.now()}`
        let canWrite = true
        const connection = new TestConnection()
        connections.push(connection)
        setupWSConnection(connection, { url: `/${room}` }, { docName: room, canWrite: async () => canWrite })
        connection.emit('message', updateMessage('before'))
        await settle()
        expect(docs.get(room)?.getText('body').toString()).toBe('before')

        canWrite = false
        connection.emit('message', updateMessage('after'))
        await settle()
        expect(connection.closeCode).toBe(4003)
        expect(docs.get(room)?.getText('body').toString()).toBe('before')
    })

    it('replays buffered messages and still enforces the write ACL', async () => {
        const room = `early-${Date.now()}`

        // 早到的读请求经 pendingMessages 回放后应收到 sync step 2 回包，不能被丢弃。
        const reader = new TestConnection()
        connections.push(reader)
        const syncRequest = encoding.createEncoder()
        encoding.writeVarUint(syncRequest, 0)
        syncProtocol.writeSyncStep1(syncRequest, new Y.Doc())
        setupWSConnection(
            reader,
            { url: `/${room}` },
            {
                docName: room,
                canWrite: async () => false,
                pendingMessages: [encoding.toUint8Array(syncRequest) as unknown as ArrayBuffer],
            }
        )
        await settle()
        expect(reader.closeCode).toBeUndefined()
        expect(reader.sent.length).toBeGreaterThan(1)

        // 早到的写包也必须走 canWrite 校验，只读连接同样收到 4003 且内容不变。
        const writer = new TestConnection()
        connections.push(writer)
        setupWSConnection(
            writer,
            { url: `/${room}` },
            {
                docName: room,
                canWrite: async () => false,
                pendingMessages: [updateMessage('forbidden') as unknown as ArrayBuffer],
            }
        )
        await settle()
        expect(writer.closeCode).toBe(4003)
        expect(docs.get(room)?.getText('body').toString()).toBe('')
    })
})
