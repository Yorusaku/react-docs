import { mergeConfig } from 'vitest/config'

import { createSharedVitestConfig } from './vitest.shared'

export default mergeConfig(createSharedVitestConfig(), {
    test: {
        include: ['test/contract/**/*.test.ts'],
    },
})
