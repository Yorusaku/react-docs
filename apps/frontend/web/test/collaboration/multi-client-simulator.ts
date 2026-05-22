import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

export interface ClientConfig {
    wsUrl: string
    roomName: string
    token?: string
}

export class MultiClientSimulator {
    private clients: Y.Doc[] = []
    private providers: WebsocketProvider[] = []
    private config: ClientConfig

    constructor(config: ClientConfig) {
        this.config = config
    }

    private async waitForProviderSync(provider: WebsocketProvider, timeoutMs = 5000): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
                provider.off('sync', onSync)
                reject(new Error(`websocket sync timeout (${timeoutMs}ms)`))
            }, timeoutMs)

            const onSync = (isSynced: boolean) => {
                if (!isSynced) {
                    return
                }
                clearTimeout(timer)
                provider.off('sync', onSync)
                resolve()
            }

            provider.on('sync', onSync)
        })
    }

    async createClients(count: number): Promise<void> {
        for (let i = 0; i < count; i++) {
            const doc = new Y.Doc()
            const provider = new WebsocketProvider(this.config.wsUrl, this.config.roomName, doc, {
                params: this.config.token ? { token: this.config.token } : {},
            })

            this.clients.push(doc)
            this.providers.push(provider)

            await this.waitForProviderSync(provider)
        }
    }

    async simulateConcurrentEdit(clientIndex: number, text: string): Promise<void> {
        const doc = this.clients[clientIndex]
        const fragment = doc.getXmlFragment('document-store')

        doc.transact(() => {
            const paragraph = new Y.XmlElement('paragraph')
            const textNode = new Y.XmlText()
            textNode.insert(0, text)
            paragraph.insert(0, [textNode])
            fragment.insert(fragment.length, [paragraph])
        })

        await new Promise(resolve => setTimeout(resolve, 100))
    }

    async simulateNetworkDisconnect(clientIndex: number): Promise<void> {
        const provider = this.providers[clientIndex]
        provider.disconnect()
    }

    async simulateNetworkReconnect(clientIndex: number): Promise<void> {
        const provider = this.providers[clientIndex]
        provider.connect()
        await this.waitForProviderSync(provider)
    }

    async verifyConsistency(): Promise<boolean> {
        if (this.clients.length < 2) {
            return true
        }

        const firstDocState = Y.encodeStateAsUpdate(this.clients[0])

        for (let i = 1; i < this.clients.length; i++) {
            const currentDocState = Y.encodeStateAsUpdate(this.clients[i])

            if (firstDocState.length !== currentDocState.length) {
                return false
            }

            for (let j = 0; j < firstDocState.length; j++) {
                if (firstDocState[j] !== currentDocState[j]) {
                    return false
                }
            }
        }

        return true
    }

    getDocumentContent(clientIndex: number): string {
        const doc = this.clients[clientIndex]
        const fragment = doc.getXmlFragment('document-store')
        return fragment.toString()
    }

    async cleanup(): Promise<void> {
        for (const provider of this.providers) {
            provider.disconnect()
            provider.destroy()
        }

        for (const doc of this.clients) {
            doc.destroy()
        }

        this.clients = []
        this.providers = []
    }
}
