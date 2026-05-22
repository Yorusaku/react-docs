import { expect, test } from '@playwright/test'

import { generateTestUser } from './fixtures/test-users'

test.describe('Document CRUD', () => {
    test.beforeEach(async ({ page }) => {
        const testUser = generateTestUser()
        await page.goto('/account/login')
        await page.getByRole('button', { name: /注册/i }).click()
        await page.getByPlaceholder(/用户名/i).fill(testUser.username)
        await page.getByPlaceholder(/密码/i).fill(testUser.password)
        await page.getByRole('button', { name: /注册/i }).click()
        await page.waitForURL(/\/doc/)
    })

    test('should create a new document', async ({ page }) => {
        await page.getByRole('button', { name: /新建页面/i }).click()
        await page.waitForURL(/\/doc\/[a-zA-Z0-9-]+/)
        await expect(page.locator('input[placeholder="Untitled Document"]')).toBeVisible()
    })

    test('should edit document title', async ({ page }) => {
        await page.getByRole('button', { name: /新建页面/i }).click()
        await page.waitForURL(/\/doc\/[a-zA-Z0-9-]+/)

        const titleInput = page.locator('input[placeholder="Untitled Document"]')
        await titleInput.fill('E2E Test Document')
        await titleInput.blur()

        await page.waitForTimeout(1000)
        await expect(titleInput).toHaveValue('E2E Test Document')
    })

    test('should edit document content', async ({ page }) => {
        await page.getByRole('button', { name: /新建页面/i }).click()
        await page.waitForURL(/\/doc\/[a-zA-Z0-9-]+/)

        const editor = page.locator('[contenteditable="true"]').first()
        await editor.click()
        await editor.fill('This is test content')

        await page.waitForTimeout(500)
        await expect(editor).toContainText('This is test content')
    })

    test('should delete document to trash', async ({ page }) => {
        await page.getByRole('button', { name: /新建页面/i }).click()
        await page.waitForURL(/\/doc\/[a-zA-Z0-9-]+/)

        const titleInput = page.locator('input[placeholder="Untitled Document"]')
        await titleInput.fill('Document to Delete')
        await titleInput.blur()
        await page.waitForTimeout(500)

        await page.goto('/doc')
        await page.getByText('Document to Delete').first().click({ button: 'right' })
        await page.getByRole('menuitem', { name: /删除/i }).click()

        await page.goto('/trash')
        await expect(page.getByText('Document to Delete')).toBeVisible()
    })
})
