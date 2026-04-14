import { describe, expect, it } from 'vitest'

import { hashPassword, verifyPassword } from '../src/modules/user/password'

describe('password', () => {
    it('should hash and verify password', async () => {
        const rawPassword = 'My-Test-Password-123'
        const hashedPassword = await hashPassword(rawPassword)

        expect(hashedPassword).not.toBe(rawPassword)
        await expect(verifyPassword(rawPassword, hashedPassword)).resolves.toBe(true)
        await expect(verifyPassword('wrong-password', hashedPassword)).resolves.toBe(false)
    })
})
