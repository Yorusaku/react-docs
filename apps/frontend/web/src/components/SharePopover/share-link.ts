export const buildDocShareLink = (origin: string, pageId?: string) => {
    if (!pageId) {
        return `${origin}/doc`
    }

    return `${origin}/doc/${pageId}`
}
