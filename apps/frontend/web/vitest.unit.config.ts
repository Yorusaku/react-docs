import { mergeConfig } from 'vitest/config'

import { createSharedVitestConfig } from './vitest.shared'

export default mergeConfig(createSharedVitestConfig(), {
    test: {
        include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
        exclude: ['test/collaboration/**/*.test.ts', 'test/contract/**/*.test.ts'],
    },
})
