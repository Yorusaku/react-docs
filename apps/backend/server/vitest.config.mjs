import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
        setupFiles: ['test/setup.ts'],
        env: {
            JWT_SECRET: 'test-jwt-secret',
        },
    },
})
