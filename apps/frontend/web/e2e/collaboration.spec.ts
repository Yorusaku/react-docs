import { expect, test } from '@playwright/test'

import { generateTestUser } from './fixtures/test-users'

test.describe('Collaboration', () => {
    test('should show remote user when two users open same document', async ({ browser }) => {
        const user1 = generateTestUser()
        const user2 = generateTestUser()

        // Create two browser contexts
        const context1 = await browser.newContext()
        const context2 = await browser.newContext()
        const page1 = await context1.newPage()
        const page2 = await context2.newPage()

        // User 1: Register and create document
        await page1.goto('/account/login')
        await page1.getByRole('button', { name: /注册/i }).click()
        await page1.getByPlaceholder(/用户名/i).fill(user1.username)
        await page1.getByPlaceholder(/密码/i).fill(user1.password)
        await page1.getByRole('button', { name: /注册/i }).click()
        await page1.waitForURL(/\/doc/)

        await page1.getByRole('button', { name: /新建页面/i }).click()
        await page1.waitForURL(/\/doc\/[a-zA-Z0-9-]+/)
        const docUrl = page1.url()

        // User 2: Register
        await page2.goto('/account/login')
        await page2.getByRole('button', { name: /注册/i }).click()
        await page2.getByPlaceholder(/用户名/i).fill(user2.username)
        await page2.getByPlaceholder(/密码/i).fill(user2.password)
        await page2.getByRole('button', { name: /注册/i }).click()
        await page2.waitForURL(/\/doc/)

        // User 2: Open same document
        await page2.goto(docUrl)
        await page2.waitForTimeout(2000)

        // Check if remote user avatar is visible on page1
        const avatarList = page1.locator('[data-testid="avatar-list"]')
        await expect(avatarList).toBeVisible({ timeout: 5000 })

        await context1.close()
        await context2.close()
    })

    test('should sync content between two users', async ({ browser }) => {
        const user1 = generateTestUser()
        const user2 = generateTestUser()

        const context1 = await browser.newContext()
        const context2 = await browser.newContext()
        const page1 = await context1.newPage()
        const page2 = await context2.newPage()

        // User 1: Register and create document
        await page1.goto('/account/login')
        await page1.getByRole('button', { name: /注册/i }).click()
        await page1.getByPlaceholder(/用户名/i).fill(user1.username)
        await page1.getByPlaceholder(/密码/i).fill(user1.password)
        await page1.getByRole('button', { name: /注册/i }).click()
        await page1.waitForURL(/\/doc/)
        await page1.getByRole('button', { name: /新建页面/i }).click()
        await page1.waitForURL(/\/doc\/[a-zA-Z0-9-]+/)
        const docUrl = page1.url()

        // User 2: Register and open same document
        await page2.goto('/account/login')
        await page2.getByRole('button', { name: /注册/i }).click()
        await page2.getByPlaceholder(/用户名/i).fill(user2.username)
        await page2.getByPlaceholder(/密码/i).fill(user2.password)
        await page2.getByRole('button', { name: /注册/i }).click()
        await page2.waitForURL(/\/doc/)
        await page2.goto(docUrl)
        await page2.waitForTimeout(1000)

        // User 1: Type content
        const editor1 = page1.locator('[contenteditable="true"]').first()
        await editor1.click()
        await editor1.fill('Collaboration test content')
        await page1.waitForTimeout(1000)

        // User 2: Should see the content
        const editor2 = page2.locator('[contenteditable="true"]').first()
        await expect(editor2).toContainText('Collaboration test content', { timeout: 5000 })

        await context1.close()
        await context2.close()
    })
})
