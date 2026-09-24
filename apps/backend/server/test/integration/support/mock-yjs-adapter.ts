import * as Y from 'yjs'

/**
 * 集成测试用的 YJS 适配器替身。
 * 返回真实 Y.Doc（page.service 会对其调用 Y.encodeStateAsUpdate），
 * 只把 XML 片段替换为固定内容，避免测试依赖 y-postgresql 适配器。
 */
export function createMockYjsAdapter(xml = '') {
    return {
        getYDoc: async () => {
            const doc = new Y.Doc()
            Object.assign(doc, { getXmlFragment: () => ({ toJSON: () => xml }) })
            return doc
        },
        clearDocument: async () => {},
        storeUpdate: async () => {},
        setDocumentUpdate: async () => {},
    }
}
