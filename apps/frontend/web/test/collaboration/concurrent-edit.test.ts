import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { isCollaborationTestEnabled, resolveCollaborationWsUrl } from './env'
import { MultiClientSimulator } from './multi-client-simulator'

const describeCollaboration = isCollaborationTestEnabled() ? describe : describe.skip

describeCollaboration('Concurrent Edit Test', () => {
    let simulator: MultiClientSimulator

    beforeEach(async () => {
        const wsUrl = resolveCollaborationWsUrl()
        if (!wsUrl) {
            throw new Error('collaboration test env is missing')
        }

        simulator = new MultiClientSimulator({
            wsUrl,
            roomName: `test-room-${Date.now()}`,
            token: process.env.VITE_WS_TOKEN,
        })
    })

    afterEach(async () => {
        await simulator.cleanup()
    })

    it('should handle concurrent edits from 2 clients', async () => {
        await simulator.createClients(2)

        await simulator.simulateConcurrentEdit(0, 'Client 0 content')
        await simulator.simulateConcurrentEdit(1, 'Client 1 content')

        await new Promise(resolve => setTimeout(resolve, 1000))

        const isConsistent = await simulator.verifyConsistency()
        expect(isConsistent).toBe(true)

        const content0 = simulator.getDocumentContent(0)
        const content1 = simulator.getDocumentContent(1)
        expect(content0).toBe(content1)
    }, 10000)

    it('should handle concurrent edits from 5 clients', async () => {
        await simulator.createClients(5)

        for (let i = 0; i < 5; i++) {
            await simulator.simulateConcurrentEdit(i, `Client ${i} content`)
        }

        await new Promise(resolve => setTimeout(resolve, 2000))

        const isConsistent = await simulator.verifyConsistency()
        expect(isConsistent).toBe(true)
    }, 15000)

    it('should handle rapid concurrent edits', async () => {
        await simulator.createClients(3)

        const editPromises = []
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 10; j++) {
                editPromises.push(simulator.simulateConcurrentEdit(i, `Client ${i} edit ${j}`))
            }
        }

        await Promise.all(editPromises)
        await new Promise(resolve => setTimeout(resolve, 2000))

        const isConsistent = await simulator.verifyConsistency()
        expect(isConsistent).toBe(true)
    }, 20000)
})
