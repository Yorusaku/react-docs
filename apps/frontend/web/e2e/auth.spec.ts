import { expect, test } from '@playwright/test'

import { generateTestUser } from './fixtures/test-users'

test.describe('Authentication Flow', () => {
    test('should register a new user successfully', async ({ page }) => {
        const testUser = generateTestUser()

        await page.goto('/account/login')
        await page.getByRole('button', { name: /注册/i }).click()

        await page.getByPlaceholder(/用户名/i).fill(testUser.username)
        await page.getByPlaceholder(/密码/i).fill(testUser.password)
        await page.getByRole('button', { name: /注册/i }).click()

        await expect(page).toHaveURL(/\/doc/, { timeout: 10000 })
    })

    test('should login successfully', async ({ page }) => {
        const testUser = generateTestUser()

        // Register first
        await page.goto('/account/login')
        await page.getByRole('button', { name: /注册/i }).click()
        await page.getByPlaceholder(/用户名/i).fill(testUser.username)
        await page.getByPlaceholder(/密码/i).fill(testUser.password)
        await page.getByRole('button', { name: /注册/i }).click()
        await page.waitForURL(/\/doc/)

        // Logout
        await page.evaluate(() => localStorage.clear())
        await page.goto('/account/login')

        // Login
        await page.getByPlaceholder(/用户名/i).fill(testUser.username)
        await page.getByPlaceholder(/密码/i).fill(testUser.password)
        await page.getByRole('button', { name: /登录/i }).click()

        await expect(page).toHaveURL(/\/doc/, { timeout: 10000 })
    })

    test('should fail login with wrong password', async ({ page }) => {
        const testUser = generateTestUser()

        // Register first
        await page.goto('/account/login')
        await page.getByRole('button', { name: /注册/i }).click()
        await page.getByPlaceholder(/用户名/i).fill(testUser.username)
        await page.getByPlaceholder(/密码/i).fill(testUser.password)
        await page.getByRole('button', { name: /注册/i }).click()
        await page.waitForURL(/\/doc/)

        // Logout
        await page.evaluate(() => localStorage.clear())
        await page.goto('/account/login')

        // Try login with wrong password
        await page.getByPlaceholder(/用户名/i).fill(testUser.username)
        await page.getByPlaceholder(/密码/i).fill('WrongPassword123!')
        await page.getByRole('button', { name: /登录/i }).click()

        await expect(page).toHaveURL(/\/account\/login/)
    })

    test('should redirect to login when accessing protected page without auth', async ({ page }) => {
        await page.evaluate(() => localStorage.clear())
        await page.goto('/doc')

        await expect(page).toHaveURL(/\/account\/login/, { timeout: 5000 })
    })
})
