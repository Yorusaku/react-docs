import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { isCollaborationTestEnabled, resolveCollaborationWsUrl } from './env'
import { MultiClientSimulator } from './multi-client-simulator'

const describeCollaboration = isCollaborationTestEnabled() ? describe : describe.skip

describeCollaboration('Reconnection Test', () => {
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

    it('should sync after client reconnects', async () => {
        await simulator.createClients(2)

        // Client 0 disconnects
        await simulator.simulateNetworkDisconnect(0)
        await new Promise(resolve => setTimeout(resolve, 500))

        // Client 1 edits while client 0 is offline
        await simulator.simulateConcurrentEdit(1, 'Content while client 0 offline')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Client 0 reconnects
        await simulator.simulateNetworkReconnect(0)
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Verify consistency
        const isConsistent = await simulator.verifyConsistency()
        expect(isConsistent).toBe(true)

        const content0 = simulator.getDocumentContent(0)
        const content1 = simulator.getDocumentContent(1)
        expect(content0).toBe(content1)
    }, 15000)

    it('should handle multiple disconnect/reconnect cycles', async () => {
        await simulator.createClients(2)

        for (let i = 0; i < 3; i++) {
            await simulator.simulateNetworkDisconnect(0)
            await new Promise(resolve => setTimeout(resolve, 300))

            await simulator.simulateConcurrentEdit(1, `Edit during disconnect ${i}`)
            await new Promise(resolve => setTimeout(resolve, 300))

            await simulator.simulateNetworkReconnect(0)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        const isConsistent = await simulator.verifyConsistency()
        expect(isConsistent).toBe(true)
    }, 20000)

    it('should not lose data during reconnection', async () => {
        await simulator.createClients(2)

        // Both clients edit
        await simulator.simulateConcurrentEdit(0, 'Initial content from client 0')
        await simulator.simulateConcurrentEdit(1, 'Initial content from client 1')
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Client 0 disconnects
        await simulator.simulateNetworkDisconnect(0)
        await new Promise(resolve => setTimeout(resolve, 500))

        // Client 1 continues editing
        await simulator.simulateConcurrentEdit(1, 'More content from client 1')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Client 0 reconnects
        await simulator.simulateNetworkReconnect(0)
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Verify all content is present
        const content = simulator.getDocumentContent(0)
        expect(content).toContain('Initial content from client 0')
        expect(content).toContain('Initial content from client 1')
        expect(content).toContain('More content from client 1')

        const isConsistent = await simulator.verifyConsistency()
        expect(isConsistent).toBe(true)
    }, 15000)
})
