export interface Page {
    id: number
    pageId: string
    emoji: string
    title: string
    description?: string | null
    createdAt: string
    updatedAt?: string
    deletedAt?: string | null
    lastSnapshotAt?: string | null
}
