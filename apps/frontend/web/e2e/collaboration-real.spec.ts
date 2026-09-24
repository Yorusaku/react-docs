import { expect, test } from '@playwright/test'
import * as Y from 'yjs'

test.skip(process.env.VITE_API_MODE !== 'real', '需要真实后端和独立测试数据库')

const uniqueUser = (role: string) => ({
    username: `e2e_${role}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    password: 'Test123456!',
})

const writeVarUint = (value: number) => {
    const bytes: number[] = []
    while (value > 127) {
        bytes.push((value & 127) | 128)
        value >>>= 7
    }
    bytes.push(value)
    return bytes
}

test('双账号同步、降权只读与原始 WebSocket 拒写', async ({ browser, request }) => {
    const owner = uniqueUser('owner')
    const member = uniqueUser('member')
    const ownerRegistration = await request.post('/api/user/register', { data: owner })
    const memberRegistration = await request.post('/api/user/register', { data: member })
    expect(ownerRegistration.ok()).toBeTruthy()
    expect(memberRegistration.ok()).toBeTruthy()
    const ownerId = (await ownerRegistration.json()).data.id as number
    const memberId = (await memberRegistration.json()).data.id as number

    const login = async (user: typeof owner) => {
        const response = await request.post('/api/auth/login', { data: user })
        expect(response.ok()).toBeTruthy()
        return (await response.json()).data.access_token as string
    }
    const ownerToken = await login(owner)
    const memberToken = await login(member)
    const ownerHeaders = { Authorization: `Bearer ${ownerToken}` }

    const created = await request.post('/api/page', { headers: ownerHeaders, data: { title: '协同验收', emoji: '文' } })
    expect(created.ok()).toBeTruthy()
    const pageId = (await created.json()).data.pageId as string
    const invited = await request.post(`/api/page/${pageId}/members/invite`, {
        headers: ownerHeaders,
        data: { username: member.username, role: 'editor', operations: [] },
    })
    expect(invited.ok()).toBeTruthy()

    const ownerContext = await browser.newContext()
    const memberContext = await browser.newContext()
    await ownerContext.addInitScript(token => localStorage.setItem('token', token), ownerToken)
    await memberContext.addInitScript(token => localStorage.setItem('token', token), memberToken)
    const ownerPage = await ownerContext.newPage()
    const memberPage = await memberContext.newPage()
    try {
        await Promise.all([ownerPage.goto(`/doc/${pageId}`), memberPage.goto(`/doc/${pageId}`)])
        const ownerEditor = ownerPage.locator('[contenteditable="true"]').first()
        const memberEditor = memberPage.locator('[contenteditable="true"]').first()
        await expect(ownerEditor).toBeVisible()
        await expect(memberEditor).toBeVisible()
        await ownerEditor.fill('owner 已写入')
        await expect(memberPage.locator('.bn-editor')).toContainText('owner 已写入')
        await memberEditor.fill('member 已写入')
        await expect(ownerPage.locator('.bn-editor')).toContainText('member 已写入')

        const downgraded = await request.put(`/api/page/${pageId}/acl`, {
            headers: ownerHeaders,
            data: {
                members: [
                    { userId: ownerId, role: 'owner', operations: [] },
                    { userId: memberId, role: 'viewer', operations: [] },
                ],
            },
        })
        expect(downgraded.ok()).toBeTruthy()
        await expect(memberPage.locator('h1 input')).toHaveAttribute('readonly', '', { timeout: 10000 })
        await expect(memberPage.locator('.bn-editor')).toHaveAttribute('contenteditable', 'false')
        await expect(memberPage.getByRole('button', { name: '发表评论' })).toHaveCount(0)

        const source = new Y.Doc()
        source.getText('raw-write-probe').insert(0, 'forbidden')
        const update = Y.encodeStateAsUpdate(source)
        source.destroy()
        const packet = [0, 2, ...writeVarUint(update.length), ...update]
        const closeCode = await memberPage.evaluate(
            ({ pageId, token, packet }) =>
                new Promise<number>((resolve, reject) => {
                    const socket = new WebSocket(
                        `ws://${window.location.hostname}:8082/doc-yjs?room=${encodeURIComponent(
                            `miaoma-doc-${pageId}`
                        )}&token=${encodeURIComponent(token)}`
                    )
                    const timer = window.setTimeout(() => reject(new Error('WebSocket 未拒绝写入')), 10000)
                    socket.binaryType = 'arraybuffer'
                    socket.onopen = () => socket.send(new Uint8Array(packet))
                    socket.onclose = event => {
                        window.clearTimeout(timer)
                        resolve(event.code)
                    }
                    socket.onerror = () => {
                        window.clearTimeout(timer)
                        reject(new Error('WebSocket 连接失败'))
                    }
                }),
            { pageId, token: memberToken, packet }
        )
        expect(closeCode).toBe(4003)
        await expect(ownerPage.locator('.bn-editor')).toContainText('member 已写入')
        await expect(ownerPage.locator('.bn-editor')).not.toContainText('forbidden')
    } finally {
        await ownerContext.close()
        await memberContext.close()
    }
})
