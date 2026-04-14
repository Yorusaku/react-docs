import { Edge, Node } from '@xyflow/react'

const ensureText = (value: unknown, fallback: string) => {
    if (typeof value !== 'string') {
        return fallback
    }

    const cleaned = value.trim()
    return cleaned.length > 0 ? cleaned : fallback
}

export interface NormalizedGraphPage {
    pageId: string
    emoji: string
    title: string
    links: string[]
}

export const normalizeGraphPages = (rawPages: unknown): NormalizedGraphPage[] => {
    if (!Array.isArray(rawPages)) {
        return []
    }

    const normalized: NormalizedGraphPage[] = []

    for (const page of rawPages) {
        const pageId = ensureText((page as { pageId?: unknown })?.pageId, '')
        if (!pageId) {
            continue
        }

        const rawLinks = (page as { links?: unknown })?.links
        const links = Array.isArray(rawLinks)
            ? rawLinks.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            : []

        normalized.push({
            pageId,
            emoji: ensureText((page as { emoji?: unknown })?.emoji, '??'),
            title: ensureText((page as { title?: unknown })?.title, 'Untitled'),
            links,
        })
    }

    return normalized
}

export const buildGraphElements = (rawPages: unknown): { nodes: Node[]; edges: Edge[] } => {
    const pages = normalizeGraphPages(rawPages)
    const pageIdSet = new Set(pages.map(page => page.pageId))

    const nodes: Node[] = pages.map(page => {
        return {
            id: page.pageId,
            type: 'graph',
            data: {
                emoji: page.emoji,
                title: page.title,
            },
            position: {
                x: 0,
                y: 0,
            },
        }
    })

    const edges: Edge[] = []
    const edgeIdSet = new Set<string>()

    for (const page of pages) {
        for (const link of page.links) {
            if (!pageIdSet.has(link) || link === page.pageId) {
                continue
            }

            const edgeId = `${page.pageId}->${link}`
            if (edgeIdSet.has(edgeId)) {
                continue
            }

            edgeIdSet.add(edgeId)
            edges.push({
                id: edgeId,
                type: 'graph',
                source: page.pageId,
                target: link,
                data: {
                    links: page.links,
                },
            })
        }
    }

    return {
        nodes,
        edges,
    }
}
