const trimEnv = (value: string | undefined) => (value ? value.trim() : '')

export const resolveCollaborationWsUrl = () => {
    if (trimEnv(process.env.RUN_COLLAB_TESTS) !== '1') {
        return null
    }
    const host = trimEnv(process.env.VITE_WS_HOST)
    const port = trimEnv(process.env.VITE_WS_PORT)
    if (!host || !port) {
        return null
    }
    const protocol = trimEnv(process.env.VITE_WS_PROTOCOL) || 'ws'
    return `${protocol}://${host}:${port}/doc-yjs`
}

export const isCollaborationTestEnabled = () => {
    return resolveCollaborationWsUrl() !== null
}
