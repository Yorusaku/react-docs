import { describe, expect, it } from 'vitest'

import { AiService } from '../src/modules/ai/ai.service'
import type { PageAccessService } from '../src/modules/page/page-access.service'

const runReal = process.env.RUN_AI_REAL_TESTS === '1'
const describeReal = runReal ? describe : describe.skip

/**
 * 方舟 Coding Plan 真实调用验证，默认跳过。
 * 仅当 RUN_AI_REAL_TESTS=1 且进程环境提供 AI_API_BASE_URL / AI_API_KEY / AI_MODEL 时执行；
 * 密钥只从环境变量读取，不写入仓库，也不打印到日志。
 */
describeReal('AiService 方舟真实调用（opt-in）', () => {
    it('润色返回非空且长度合规的文本', async () => {
        const baseUrl = process.env.AI_API_BASE_URL
        const apiKey = process.env.AI_API_KEY
        const model = process.env.AI_MODEL
        expect(baseUrl, 'AI_API_BASE_URL 未配置').toBeTruthy()
        expect(apiKey, 'AI_API_KEY 未配置').toBeTruthy()
        expect(model, 'AI_MODEL 未配置').toBeTruthy()

        const service = new AiService({ assertAction: async () => {} } as unknown as PageAccessService)
        const startedAt = Date.now()
        const result = await service.rewrite(
            { pageId: 'real-call-probe', action: 'polish', text: '这个功能我觉得还行吧，可以先观察一段时间再说。' },
            2103907183
        )
        const elapsedMs = Date.now() - startedAt

        // eslint-disable-next-line no-console -- 仅输出耗时与长度摘要，便于人工核对
        console.log(`[ai-real] model=${model} baseUrl=${baseUrl} elapsedMs=${elapsedMs} length=${result.text.length}`)
        expect(result.text.trim().length).toBeGreaterThan(0)
        expect(result.text.length).toBeLessThanOrEqual(8000)
    }, 60000)
})
