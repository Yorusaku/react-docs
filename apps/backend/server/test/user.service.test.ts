import { describe, expect, it, vi } from 'vitest'

import { hashPassword } from '../src/modules/user/password'
import { UserService } from '../src/modules/user/user.service'

describe('UserService', () => {
    it('should validate user with hashed password', async () => {
        const password = await hashPassword('123456')
        const user = {
            id: 1,
            username: 'tester',
            password,
        }

        const userRepository = {
            findOne: vi.fn().mockResolvedValue(user),
            create: vi.fn(),
            save: vi.fn(),
        }

        const userService = new UserService(userRepository as never)

        await expect(userService.validateUser('tester', '123456')).resolves.toEqual(user)
        await expect(userService.validateUser('tester', 'wrong')).resolves.toBeNull()
    })
})
