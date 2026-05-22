import path from 'node:path'
import { fileURLToPath } from 'node:url'

import SwaggerParser from '@apidevtools/swagger-parser'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contractPath = path.resolve(__dirname, '../../../../docs/openapi/miaoma-docs-mock-openapi.yaml')

try {
    await SwaggerParser.validate(contractPath)
    console.log(`[contract:lint] OK: ${contractPath}`)
} catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[contract:lint] Failed: ${message}`)
    process.exit(1)
}
