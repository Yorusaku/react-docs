import { describe, expect, it } from 'vitest'

import { buildGraphElements } from '../src/pages/DocGraph/graph-data'

describe('buildGraphElements', () => {
    it('should normalize dirty graph payload', () => {
        const payload = [
            {
                pageId: 'pageA',
                title: 'A',
                emoji: '??',
                links: ['pageB', '', null, 'missing-page'],
            },
            {
                pageId: 'pageB',
                title: 'B',
                emoji: '??',
                links: undefined,
            },
            {
                title: 'invalid-page',
            },
        ]

        const { nodes, edges } = buildGraphElements(payload)

        expect(nodes.map(node => node.id)).toEqual(['pageA', 'pageB'])
        expect(edges).toHaveLength(1)
        expect(edges[0].source).toBe('pageA')
        expect(edges[0].target).toBe('pageB')
    })
})
