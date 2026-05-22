import { z } from 'zod'

const envSchema = z.object({
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    PG_HOST: z.string().default('127.0.0.1'),
    PG_PORT: z.coerce.number().int().default(5433),
    PG_USER: z.string().default('postgres'),
    PG_PASSWORD: z.string().default('xiaoer'),
    PG_DATABASE: z.string().default('postgres'),
    SERVER_PORT: z.coerce.number().int().default(8082),
    DIFY_API_KEY: z.string().optional(),
    DIFY_API_BASE_URL: z.string().url().optional(),
})

export type ValidatedEnv = z.infer<typeof envSchema>

export function validateEnv(): ValidatedEnv {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
        const errors = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
        throw new Error(`Environment validation failed:\n${errors}`)
    }
    return result.data
}
