import ts from 'typescript'
import { defineConfig } from 'vitest/config'

// Vitest 默认走 esbuild：它既不产出 emitDecoratorMetadata，还会把 tsc 产出的
// `let X = class X {}` 内层类名改写成 `X2`，破坏 TypeORM 的字符串目标关系
// （如 @ManyToOne('UserEntity')）。因此这里先用 tsc 预转换补齐装饰器元数据，
// 并让这些源码跳过 esbuild 的二次变换。
const decoratorMetadataPlugin = {
    name: 'ts-decorator-metadata',
    enforce: 'pre',
    transform(code, id) {
        if (!id.endsWith('.ts') || id.includes('node_modules')) return null
        const result = ts.transpileModule(code, {
            fileName: id,
            compilerOptions: {
                target: ts.ScriptTarget.ES2021,
                module: ts.ModuleKind.ESNext,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                useDefineForClassFields: false,
                sourceMap: true,
                inlineSources: true,
            },
        })
        return { code: result.outputText, map: result.sourceMapText }
    },
}

export default defineConfig({
    plugins: [decoratorMetadataPlugin],
    esbuild: {
        exclude: [/[\\/](src|test)[\\/][^?]*\.ts$/],
    },
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
        setupFiles: ['test/setup.ts'],
        env: {
            JWT_SECRET: 'test-jwt-secret',
        },
        testTimeout: 30000,
    },
})