import { describe, expect, it } from 'vitest'

import { buildDocShareLink } from '../src/components/SharePopover/share-link'

describe('buildDocShareLink', () => {
    it('should build doc detail link with page id', () => {
        const url = buildDocShareLink('https://miaoma.test', 'page123')

        expect(url).toBe('https://miaoma.test/doc/page123')
    })

    it('should fallback to doc list link without page id', () => {
        const url = buildDocShareLink('https://miaoma.test')

        expect(url).toBe('https://miaoma.test/doc')
    })
})
