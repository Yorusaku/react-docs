import { describe, expect, it } from 'vitest'

import { sanitizeTitleText } from '../src/pages/Doc/title-sanitize'

describe('sanitizeTitleText', () => {
    it('should remove control characters and trim spaces', () => {
        const result = sanitizeTitleText('  Hello\u0000\u001F World  ')

        expect(result).toBe('Hello World')
    })

    it('should keep maximum 255 chars', () => {
        const value = 'a'.repeat(300)

        expect(sanitizeTitleText(value)).toHaveLength(255)
    })
})
