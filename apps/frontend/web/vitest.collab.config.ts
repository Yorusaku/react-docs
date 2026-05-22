import { mergeConfig } from 'vitest/config'

import { createSharedVitestConfig } from './vitest.shared'

export default mergeConfig(createSharedVitestConfig(), {
    test: {
        include: ['test/collaboration/**/*.test.ts'],
        testTimeout: 30_000,
    },
})
