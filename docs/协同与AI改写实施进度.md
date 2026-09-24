# 协同文档闭环与 AI 选区改写：实施进度

更新时间：2026-09-25（最近一轮验证于 01:31 执行）。
本文件供后续接手者快速恢复上下文；**以仓库当前代码和重新运行命令的结果为准**，本文件的结论可能随代码变化而过时。

---

## 1. 目标与边界

### 目标

1. **两账号协同编辑**：两个账号打开同一文档，双向内容同步。
2. **viewer 只读**：包含两个层次
    - 前端只读（标题 readonly、正文 `contenteditable=false`、评论入口隐藏）；
    - **原始 WebSocket 写入拒绝**（绕过前端直接发 y-protocol 写包 → 关闭码 4003）；
    - **权限变更后的旧连接**（已建立的连接在降权后再次写入也要被拒绝）。
3. **单块纯文本选区 AI 改写**：润色 / 精简，带预览确认。

### 明确不做

-   不做跨文档问答、跨块改写、流式生成、新管理页、桌面专项适配。
-   移除旧主题生成块入口及 `/api/ai/chat`。
-   不将真实 API Key 写入仓库、命令或日志。

---

## 2. 进度表

| 阶段                  | 状态                      | 证据                                                                                                                                           |
| --------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 构建基线              | ✅ 已完成                 | `pnpm build` 5/5 tasks 成功、EXIT=0（2026-09-24 20:33 复跑）                                                                                   |
| 代码门禁              | ✅ 已完成                 | `pnpm gate:apps` EXIT=0（2026-09-24 19:27）；server 11 files / 58 passed + 1 skipped（opt-in 真实调用，设计预期）、web 8 files / 49 tests 全过 |
| 契约门禁              | ✅ 已完成                 | `pnpm contract:apps` EXIT=0（2026-09-24 20:32），双份 OpenAPI lint + typegen + contract test 全过                                              |
| 协同权限（单测层）    | ✅ 已完成                 | `test/yjs-write-acl.test.ts` 3 tests 通过，含早到消息回放仍走 ACL 的回归守卫                                                                   |
| AI 选区改写（单测层） | ✅ 已完成                 | `test/selection-rewrite.test.tsx` 3 tests 通过（预览/取消/确认/过期结果）                                                                      |
| WS 升级路由           | ✅ 已修复并验证           | 见 §5.4：房间名移到 query，`test/doc-yjs-gateway.test.ts` 9 tests 通过                                                                         |
| 数据库集成测试        | ✅ 已完成                 | 见 §5.1，`pnpm --filter @miaoma-doc/server test:integration` EXIT=0，10 files / 60 tests passed / 0 skipped（2026-09-24 19:24）                |
| 双账号 E2E            | ✅ 已完成                 | 见 §5.2 / §6.3，`collaboration-real.spec.ts` 1 passed（2026-09-24 17:13，15.4s）                                                               |
| 方舟真实模型调用      | ✅ 已完成（用户本地实测） | 用户于 2026-09-25 在已注入密钥的本地终端按 §6.5 运行并报告 `pass`。当前代理进程无法继承该终端环境，因此未在此进程重复读取或输出密钥。          |

---

## 3. 本轮已修复的问题（**不要重复排查**）

本任务分两轮修复。第一轮（§3.1–3.4）让 gate:apps 从失败到通过：其中 3.1–3.3 是**本任务新增文件引入的**；3.4 是新增测试暴露出的 DI 元数据问题（生产构建不受影响）。第二轮（§3.5–3.8）为打通真实双账号 E2E 而做，暴露并修复了 4 处长期潜伏的既有缺陷，均非本任务引入，改动前真实模式从未端到端跑通。

### 3.1 `eslint.config.js` ignores 漏掉新增的 real 契约生成文件

-   **现象**：`pnpm lint:apps` 报 972 个 `prettier/prettier` 错误。
-   **根因**：ignores 只有 `'**/openapi.generated.ts'`，本任务新增的 `openapi.real.generated.ts` 未被忽略，生成物（双引号 + 分号）与 prettier 规则冲突，贡献 968 个错误。
-   **修复**：`eslint.config.js:15` 把 `'**/openapi.generated.ts'` 泛化为 `'**/*.generated.ts'`（仓库内 `.generated.ts` 仅这两个文件，均已 `git ls-files` 确认）。
-   **注意**：以后新增契约生成文件只要遵循 `*.generated.ts` 命名即自动忽略。

### 3.2 `SelectionRewrite.tsx` 缩进错位

-   **现象**：2 个 prettier 错误（36–37 行 `Insert 8 spaces`）。
-   **根因**：`const coords = view.coordsAtPos(to)` 与 `setError('')` 两行缩进层级错误（疑似手工编辑残留）。
-   **修复**：`npx eslint --fix` 自动修正，无逻辑改动。

### 3.3 `selection-rewrite.test.tsx` 缺 jsdom 环境与 React 导入 —— **会导致整个 web 单测挂死**

-   **现象**：`pnpm test:apps` 卡住不退出（本轮实测超过 20 分钟无输出），前 7 个测试文件通过后停在 `selection-rewrite.test.tsx`，最终报 `Error: Worker exited unexpectedly`。
-   **根因**（两个独立问题叠加）：
    1. `vitest.unit.config.ts` 继承 `vitest.shared.ts` 的 `environment: 'node'`，该文件**缺少 `// @vitest-environment jsdom`**（对照 `test/auth-route.test.tsx:1` 有该指令），React Testing Library 的 `render()` 在 node 环境下挂死。
    2. 补齐 jsdom 后暴露出真正错误 `ReferenceError: React is not defined` —— 该文件用了 JSX 但未 `import React from 'react'`（本仓库测试走 classic JSX runtime，对照 `auth-route.test.tsx:4`）。
-   **修复**：文件头部补 `// @vitest-environment jsdom` 与 `import React from 'react'`。
-   **排错经验**：`| tail -N` 管道会缓冲输出，后台跑门禁时**不要接管道**，改为 `> /tmp/xxx.log 2>&1` 才能看到中间进度。

### 3.4 网关构造函数缺显式 `@Inject`，导致新测试 DI 注入失败

-   **现象**：`test/doc-yjs-gateway.test.ts` 里「缺 room → 4002」「room 非法 → 4002」「无 read → 4003」「viewer 可连接」4 个用例全部实得 4001。
-   **根因**：Vitest/esbuild 转换不写 `design:paramtypes` 元数据，`Test.createTestingModule` 按类型注入时拿不到构造函数依赖，`this.jwtService` 为 `undefined`，`verifyWsToken` 抛异常走 catch 分支 close 4001。生产构建（`nest build`/dist 带 `__metadata`）不受影响。
-   **修复**：给 `DocYjsGateway` 构造函数三个参数补 `@Inject(JwtService)` / `@Inject(UserService)` / `@Inject(PageAccessService)`。语义与按类型注入等价，只是不再依赖元数据。
-   **注意**：本轮清理了调试期临时改动（`TEMP-DEBUG` 日志、探针用的 4011/4012/4013 中间关闭码、catch 里拼接 `JWT_SECRET` 的调试信息）。关闭码恢复为规范中的 4001/4002/4003，**不得再把密钥或错误细节写进 close reason**。

### 3.5 `bcryptjs` 默认导入在 CJS 下为 undefined（注册接口 500）

-   **现象**：E2E 首次注册账号时后端 500，密码哈希处 `bcrypt_1.default` 为 undefined。
-   **根因**：`tsconfig.server.json` 只开 `allowSyntheticDefaultImports`、未开 `esModuleInterop`；`bcryptjs@2.4.3` 是 CJS 包且无 `default` 导出，编译产物 `bcryptjs_1.default.hash` 随之失效。
-   **修复**：`src/modules/user/password.ts` 改为 `import * as bcrypt from 'bcryptjs'`。该文件保持无 BOM。

### 3.6 `SsoModule` 缺 `JwtModule`（整个后端起不来）

-   **现象**：`node dist/main` 启动即报 `Nest can't resolve dependencies of SsoController (?, SsoService)`，服务无法监听端口。
-   **根因**：`SsoController` 注入 `JwtService`，但 `SsoModule` 未导入 `JwtModule`。属既有缺陷，此前从未真实启动过后端。
-   **修复**：按 `DocYjsModule` 的既有写法补 `JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '1 days' } })`。该文件保留原 BOM。

### 3.7 方法级 `@UsePipes` 把 `@Param()` 也按 body schema 校验（邀请 / ACL / 评论 / 模板 / 标签接口必然 400）

-   **现象**：邀请成员、更新 ACL、评论、模板、标签等带 `@Param('id')` 的写接口，即使 body 合法也返回 400，实际是拿路径参数字符串去套对象 schema。
-   **根因**：Nest 的 `createPipesFn` 会把方法级 pipe 与 `paramPipes` 拼接后应用到**所有**可管道参数（含 `@Param`），于是 `ZodValidationPipe(bodySchema)` 也作用到了路径参数。
-   **修复**：把 `@UsePipes(new ZodValidationPipe(schema))` 改成参数级 `@Body(new ZodValidationPipe(schema))`，只作用于 body。改动文件：`page.controller.ts`（create/update/delete/updateAcl/inviteMember/updatePageTags/createSnapshot）、`comment.controller.ts`（create/update）、`template.controller.ts`（create/update）、`tag.controller.ts`（create/update）。以上文件均为无 BOM / LF，保持原样。
-   **未改**：`application.controller.ts`、`ai.controller.ts` 只有纯 body 的方法级管道，不存在 `@Param`，行为正确。

### 3.8 WebSocket 早到消息竞态：open 后立即发送的包被丢弃

-   **现象**：E2E 最后一步裸 WebSocket 连接 open 后立刻发写包，服务端未返回 4003，断言「WebSocket 未拒绝写入」失败；探针脚本 `delay=0` 超时、`delay=1000` 正常 4003。
-   **根因**：`handleConnection` 里的 JWT/ACL 校验是异步的，`setupWSConnection` 要等校验通过后才挂 `message` 监听；客户端在 open 后立即发送的包落在这个窗口里，被 Nest 的分发器吞掉。
-   **修复**：
    -   `src/fundamentals/yjs-postgresql/utils.ts`：`setupWSConnection` 新增 `pendingMessages?: ArrayBuffer[]`，挂好监听后按原顺序回放。
    -   `src/modules/doc-yjs/doc-yjs.gateway.ts`：`handleConnection` 开头先挂 `bufferEarlyMessage` 缓存早到消息；校验通过后 `connection.off(...)` 并传入 `pendingMessages`；校验失败时提前 close，缓存不生效。
-   **回归守卫**：`test/yjs-write-acl.test.ts` 新增「早到消息回放仍走 ACL」用例（读请求回放正常，早到写包同样 4003 且内容不变）。

-   两个文件均无 BOM；gateway 为 CRLF、utils 为 LF，保持原样。

---

## 4. 任务相关文件清单

### 4.1 后端

| 文件                                           | 状态     | 作用                                                                                                                                         |
| ---------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/ai/ai.service.ts`                 | M        | AI 改写核心：权限校验 → 限流（20 次/分钟/用户）→ 调方舟 OpenAI 兼容接口                                                                      |
| `src/modules/ai/ai.controller.ts`              | M        | `/api/ai/rewrite` 入口（旧 `/api/ai/chat` 已移除）                                                                                           |
| `src/modules/ai/ai.dto.ts`                     | M        | `AiRewriteDto`：`pageId` / `action`(polish\|shorten) / `text`                                                                                |
| `src/modules/ai/ai.module.ts`                  | M        | 模块装配                                                                                                                                     |
| `src/modules/doc-yjs/doc-yjs.gateway.ts`       | M        | WS 连接三段校验：JWT(4001) → room 名(4002) → ACL read(4003)；写入另用 `canWrite`。房间名从 query 读取，并显式传 `docName` 保持历史持久化 key |
| `src/fundamentals/yjs-postgresql/utils.ts`     | M        | `setupWSConnection` 增加 `canWrite` 回调；消息层识别写包并 close(4003)                                                                       |
| `src/modules/page/*`、`auth`、`user` 等        | M        | 权限/成员相关改动                                                                                                                            |
| `.env.example`                                 | M        | 新增 `AI_API_BASE_URL` / `AI_MODEL` / `AI_API_KEY`（占位值）                                                                                 |
| `test/yjs-write-acl.test.ts`                   | **新增** | 协议级拒写测试（见 §6.1）                                                                                                                    |
| `test/ai-rewrite.test.ts`                      | **新增** | AI 改写服务测试（5 tests）                                                                                                                   |
| `test/doc-yjs-gateway.test.ts`                 | **新增** | 真实 `parsePageIdFromRoom` + 真实 Nest `WsAdapter` 升级路由 + ACL 调用断言（9 tests，见 §6.4）                                               |
| `test/integration/support/test-database.ts`    | **新增** | 集成测试共享装配：显式实体数组、`_test` 库名安全断言、`resetIntegrationTables`（见 §5.1）                                                    |
| `test/integration/support/mock-yjs-adapter.ts` | **新增** | 集成测试 YJS 适配器替身：真实 `Y.Doc` + 固定 XML 片段，不依赖 y-postgresql                                                                   |
| `test/ai-real-call.test.ts`                    | **新增** | opt-in 真实调用验证，默认 `describe.skip`，仅 `RUN_AI_REAL_TESTS=1` 执行（见 §5.3）                                                          |

### 4.2 前端

| 文件                                              | 状态       | 作用                                                   |
| ------------------------------------------------- | ---------- | ------------------------------------------------------ |
| `src/components/SelectionRewrite.tsx`             | **新增**   | 选区浮层：选区快照 → 调 `aiRewrite` → 预览 → 采用/关闭 |
| `src/services/ai.ts`                              | M          | `aiRewrite` 请求封装                                   |
| `src/pages/Doc/*`                                 | M          | 只读控制、接入选区组件、移除旧 AI 面板                 |
| `src/blocks/ai/*`、`src/components/BasicAIChat/*` | **已删除** | 旧主题生成块入口                                       |
| `test/selection-rewrite.test.tsx`                 | **新增**   | AI 改写行为测试（见 §6.2）                             |
| `e2e/collaboration-real.spec.ts`                  | **新增**   | 双账号 E2E（见 §6.3），默认 skip                       |
| `src/types/openapi*.generated.ts`                 | M          | 契约生成物，勿手工编辑                                 |

### 4.3 契约与文档

| 文件                                         | 状态 | 说明      |
| -------------------------------------------- | ---- | --------- |
| `docs/openapi/miaoma-docs-mock-openapi.yaml` | M    | mock 契约 |
| `docs/openapi/miaoma-docs-real-openapi.yaml` | M    | real 契约 |
| `eslint.config.js`                           | M    | 见 §3.1   |

---

## 5. 环境与阻塞项（含已知既有技术债）

### 5.1 数据库集成测试：装配缺陷已修复，10 files / 60 tests 全绿 ✅

（2026-09-24 19:24 实测，20:36 复核）

-   **执行命令**（Vitest 不读 `.env`，必须显式给进程环境变量；本机 PostgreSQL 为原生服务 5432）：
    ```powershell
    $env:PG_HOST='127.0.0.1'; $env:PG_PORT='5432'; $env:PG_USER='postgres'; $env:PG_PASSWORD='root'; $env:PG_DATABASE_TEST='miaoma_test'
    pnpm --filter @miaoma-doc/server test:integration
    ```
-   **实测结果**：EXIT=0，`Test Files 10 passed (10)`、`Tests 60 passed (60)`、**0 skipped**，无 `.ts` require 报错、无 Nest 依赖注入缺失报错。
-   **修复的三个根因**（均为测试装配问题，未改生产代码，未放宽任何断言）：
    1. **`.ts` 直接 require**：原各文件用 `join(__dirname, '../../src', '**/**.entity{.ts,.js}')` glob，TypeORM 在 Node 下 require 到 `.ts` 实体 → `SyntaxError`。改为共享 helper 显式登记 19 个实体类 `INTEGRATION_ENTITIES`。
    2. **repository / service provider 缺失**：各文件只注册部分实体，补齐 `AuditService`、`GovernanceService`、`JwtService`、`NotificationService`、`PageAccessService` 等 provider 与全部 `forFeature`（含 `GovernanceRetentionPolicyEntityRepository`、`SearchIndexJobEntityRepository`、`OrgDepartmentEntityRepository`）。`'YJS_POSTGRESQL_ADAPTER'` 继续用 mock。
    3. **Vitest 转换丢装饰器元数据**：`vitest.config.mjs` 新增 tsc 预转换插件（`emitDecoratorMetadata: true`、`useDefineForClassFields: false`），并让 `src`/`test` 的 `.ts` 跳过 esbuild 二次变换。后者还会把 tsc 产出的 `let X = class X {}` 内层类名改写成 `X2`，破坏 `@ManyToOne('UserEntity')` 这类字符串目标关系。
-   **测试基础设施**：
    -   `test/integration/support/test-database.ts`：`INTEGRATION_ENTITIES` 显式实体数组、`integrationTypeOrmOptions()`（`synchronize: true`）、连接前 `assertSafeIntegrationDatabase()` 强制库名以后缀 `_test` 结尾，防止误连开发库。
    -   `test/integration/support/mock-yjs-adapter.ts`：返回真实 `Y.Doc`，只替换 `getXmlFragment`。
    -   `test:integration` 追加 `--no-file-parallelism`，各文件 `beforeAll` 清理自己用到的表（`TRUNCATE ... RESTART IDENTITY CASCADE`），串行换取数据确定性。
-   **精确断言未被放宽**：audit 的 `login` 计数（断言 `toBe(3)`）通过在本轮用例前额外 `resetIntegrationTables(ds, ['audit_event'])` 恢复精确语义，而不是把计数改成区间。
-   **未改生产代码**：修复过程中未触发需要改 `src/` 的真实产品缺陷；§3.5–3.8 那四处生产缺陷来自更早的双账号 E2E 打通，与本轮集成测试装配无关。

### 5.2 双账号 E2E：已通过 ✅

-   **执行命令**（cwd = `apps/frontend/web`）：
    ```powershell
    $env:VITE_API_MODE='real'; $env:VITE_WS_HOST='localhost'; $env:VITE_WS_PORT='8082'
    $env:VITE_WS_PROTOCOL='ws'; $env:VITE_API_TARGET='http://localhost:8082'
    npx playwright test collaboration-real.spec.ts --reporter=line
    ```
-   **结果**：2026-09-24 17:13，`1 passed (15.4s)`，EXIT=0（重建 `dist` 后复跑；首次于 17:01 通过，共三次一致）。
-   **环境前置（本轮已准备）**：
    1. Docker `miaoma-docs-postgresql`（`5433->5432`，`postgres/xiaoer`）；E2E 库 `miaoma_e2e` 已迁移。迁移须在 `apps/backend/server` 下用编译产物：`npx typeorm migration:run -d dist/config/typeorm-datasource.js`（本机 `ts-node` 路线不可用）。
    2. 后端在 8082（`node dist/main`），env：`PG_HOST=localhost PG_PORT=5433 PG_USER=postgres PG_PASSWORD=xiaoer PG_DATABASE=miaoma_e2e SERVER_PORT=8082 JWT_SECRET=e2e-local-secret-key-1234567890`。**`JWT_SECRET` 只作为本地进程环境变量，不得写入仓库**。
    3. Web dev server 由 Playwright 的 `webServer` 自动拉起（5173）。
    4. `VITE_API_MODE=real`，否则该 spec 顶部 `test.skip`。注意 `apps/frontend/web/.env.local`（gitignored）把 WS/API 指向 8083，跑 E2E 必须用上述进程环境变量覆盖为 8082。
-   **覆盖断言**：注册两账号 → 登录 → owner 建页 → 邀请 member 为 editor → 两浏览器上下文双向同步 → owner 降权 member 为 viewer → 前端只读三连（标题 readonly、`.bn-editor` `contenteditable=false`、无「发表评论」按钮）→ 裸 WebSocket（`ws://<host>:8082/doc-yjs?room=..`）直发写包 → 断言 `closeCode === 4003` 且 owner 端内容未被污染。
-   **打通时修复的后端缺陷**：见 §3.5（bcrypt 默认导入）、§3.6（SsoModule 缺 JwtModule）、§3.7（方法级 `@UsePipes` 误校验 `@Param`）、§3.8（WS 早到消息竞态）。四者缺一都无法真实跑通。
-   **无服务端时的正确行为**：`pnpm --filter @miaoma-doc/web test:collab` 在无 `RUN_COLLAB_TESTS=1` 时 6 tests 全部 skip、EXIT=0（见 §6.5）。

### 5.3 方舟真实模型调用：通道已验证，Chat 调用被账号配额 blocked

（2026-09-24 17:00 前后曾成功；20:33–20:36 复跑时配额耗尽）

-   **配置口径（已更正）**：
    -   `AI_API_BASE_URL=https://ark.cn-beijing.volces.com/api/coding/v3`（Coding Plan 通道）
    -   `AI_MODEL=deepseek-v4.1-flash`（model name，不需要 `ep-` 接入点）
    -   已同步到 `apps/backend/server/.env.example`，占位密钥为 `replace-with-rotated-key`，**不含真实密钥**。
    -   对照：标准 `/api/v3` + 该 model 会返回 `ModelNotOpen`；Coding Plan 必须走 `/api/coding/v3`。
-   **密钥来源**：只从进程环境变量或根目录 `.env`（单行裸值、已 gitignore）读取，**未写入任何仓库文件、命令行明文或日志**。
-   **通道与模型可用性（20:36 实测，均不含密钥）**：
    -   `GET /api/coding/v3/models` → **200**，共 135 个模型，证明 key 有效、通道通畅。
    -   模型列表中存在 `deepseek-v4-1-flash-260910`；**不存在的** `totally-bogus-model-xyz` → **404 `UnsupportedModel`**。说明该端点会先校验模型存在性，因此配额响应不会掩盖错误模型。
-   **当前阻塞（可复现证据）**：
    -   `POST /api/coding/v3/chat/completions`，model 分别用 `deepseek-v4.1-flash` 与 `deepseek-v4-1-flash-260910`，均返回：
        -   **HTTP 429**，`code = AccountQuotaExceeded`，`type = TooManyRequests`
        -   message：`You have exceeded the 5-hour usage quota. It will reset at 2026-09-24 22:50:29 +0800 CST.`
    -   对应 opt-in 测试：`RUN_AI_REAL_TESTS=1` → 1 failed，`BadGatewayException: AI upstream request failed`（`ai.service.ts:63`）。这正是上游 429 的映射结果，**不是配置错误**。
-   **早前成功记录（同日早些时候）**：`/api/coding/v3` + `deepseek-v4.1-flash` 返回 200（约 0.9–1.7s）；`AiService.rewrite` 真实测试 1 passed、`elapsedMs≈2254`、`length≈21`、文本非空且长度合规。
-   **复跑方式**：配额于 `2026-09-24 22:50:29 +0800` 重置后，按 §6.5 的命令重跑；若届时仍失败，按错误码（`ModelNotOpen` / `UnsupportedModel` / 401 / 429）如实记录，**不伪造通过**。
-   **仍在的建议**：该密钥已在对话中明文出现，建议轮换；轮换后需重新确认仍属 Coding Plan 通道。

### 5.4 ✅ 已修复：WS 升级路由（房间名从路径移到 query）

**修复落地（2026-09-24 15:43）**：采用方案 A。

-   客户端：`src/pages/Doc/index.tsx` 改为把 roomname 固定为常量 `'doc-yjs'`，文档标识放到 `params.room`（形如 `'miaoma-doc-{pageId}'`），即最终 URL 为 `/doc-yjs?token=..&room=..`。
-   服务端：`doc-yjs.gateway.ts` 新增 `resolveWsRoom(request)` 从 query 读 `room`；`parsePageIdFromRoom` 改为只接受 `miaoma-doc-*` 形状且已 `export` 供测试直接调用。
-   持久化 key 必须保持历史形状 `doc-yjs/miaoma-doc-{pageId}`（`page.service.ts` 与 `template.service.ts` 的 `roomNameByPageId` 同形状），因此网关显式传 `docName`。
-   **必须 `disableBc: true`**：roomname 固定为 `doc-yjs` 后，y-websocket 的 BroadcastChannel 通道名退化为同一常量，同源多标签会跨文档串改数据。
-   回归守卫改为 `apps/backend/server/test/doc-yjs-gateway.test.ts`（9 tests）：query 房间 URL 无效 token → 4001；旧房间子路径 → 升级阶段 `error`（记录缺陷形状，防止回退）；裸路径无效 token → 4001；缺 room / room 非法 → 4002；无 read → 4003 且断言 `assertAction(pageId, userId, 'read')`；viewer 有 read → 接受连接且 `docs.has('doc-yjs/miaoma-doc-abc123')`。
-   另外：`@nestjs/platform-ws` 的 upgrade 路由只做 pathname 精确匹配，这个结论仍然成立，方案 B/C 依旧不推荐。

下面保留修复前的排查记录，供理解缺陷形状：

**这是本轮最重要的发现。它使「双账号真实协同」和「原始 WebSocket 拒写」在真实模式下无法成立，也是 §5.2 E2E 跑不通的根因之一（即使数据库就绪也依然失败）。**

-   **现象**（实测，非推断）：用真实 Nest 应用 + `WsAdapter` 起服务后连接
    -   `/doc-yjs/miaoma-doc-abc123?token=invalid-token` → **`error`**（HTTP upgrade 阶段 socket 被销毁，网关代码根本没执行）
    -   `/doc-yjs`（裸路径）→ **`close` 4001**（升级成功，网关鉴权逻辑正常）
-   **证据链**：
    1. `apps/frontend/web/src/pages/Doc/index.tsx:121` 用 `new WebsocketProvider('ws://host:8082/doc-yjs', 'miaoma-doc-{pageId}', ...)`。
    2. y-websocket 2.0.4（`dist/y-websocket.cjs:417-419`）把 URL 拼成 `serverUrl + '/' + roomname + '?' + params`，即 `/doc-yjs/miaoma-doc-{pageId}?token=...`。
    3. `@nestjs/platform-ws@10.4.7` 的 `ws-adapter.js:123-142`：`pathname = new URL(request.url, baseUrl).pathname`，然后 **`if (pathname === wsServer.path)`** 精确匹配；不匹配则 **`socket.destroy()`**。
    4. `wsServer.path` 来自 `@WebSocketGateway({ path: 'doc-yjs' })`，经 `normalizePath` → `/doc-yjs`。
    5. 因此 `/doc-yjs/miaoma-doc-{pageId}` ≠ `/doc-yjs` → 升级被拒。
    6. 补充：**省略 `path` 也无效**，`normalizePath(undefined)` 返回 `'/'`，仍是精确匹配。
-   **结论**：Nest 的 `WsAdapter` 对 `path` 只能精确匹配，**无法承载「房间名写在路径里」的动态路径**。网关里那套 `parsePageIdFromRoom` + 4001/4002/4003 逻辑是正确的，但**永远不会被执行**（除裸路径外）。
-   **这是本任务引入的吗**：不是。`path: 'doc-yjs'` 与 `parsePageIdFromRoom` 均为**改动前既有代码**（见 `git diff doc-yjs.gateway.ts`，本任务只加了 `canWrite` 与 catch 变量）。属于长期潜伏缺陷，因为真实模式从未被端到端验证过。
-   **回归守卫（修复前后对照）**：原先在 `test/doc-yjs-ws-upgrade.test.ts`，该文件已删除；现有守卫统一在 `test/doc-yjs-gateway.test.ts`。
    -   裸路径对照用例**通过**（证明路由到达时网关行为正确）；
    -   旧房间子路径用例改为断言「升级阶段 `error`」，锁定缺陷形状不再回退。
-   **候选修法（已选定方案 A，见 §5.4 开头）**：
    -   **方案 A（推荐，改动最小且符合 Nest 用法）**：把房间名从路径移到 query。客户端改为 `new WebsocketProvider('ws://host:8082', 'doc-yjs', doc, { params: { token, room: 'miaoma-doc-{pageId}' } })` → 最终 URL 为 `/doc-yjs?token=..&room=..`，pathname 恰好等于 `/doc-yjs`，升级通过；服务端 `parsePageIdFromRoom` 改为从 query 读 `room`。
    -   **方案 B**：自定义 `WsAdapter` 子类，改写 upgrade 路由为前缀匹配。改动更深、更依赖 Nest 内部结构（`httpServersRegistry` / `ensureHttpServerExists` 均为实现细节），维护成本高。
    -   **方案 C**：绕开 Nest 网关，在 `main.ts` 自行处理 `/doc-yjs/*` 的 upgrade。侵入性最大。

---

## 6. 已验证的行为断言明细（接手者可直接复跑）

### 6.1 `apps/backend/server/test/yjs-write-acl.test.ts` —— 协议级拒写（3 tests ✅）

用 `TestConnection extends EventEmitter` 伪造 WS 连接，用 `lib0/encoding` + `y-protocols/sync` 构造**真实 y-protocol 包**：

1. `allows viewer sync requests but rejects raw updates without changing content`
    - viewer 发 `writeSyncStep1`（读请求）→ 不关闭、有回包；
    - viewer 发 `writeUpdate`（写请求）→ `closeCode === 4003`，且 `docs.get(room).getText('body')` 仍为 `'original'`。
2. `rechecks permission on each message from an existing connection`
    - 同一连接 `canWrite` 由 true 变 false 后再发写包 → `closeCode === 4003`，内容停在 `'before'`。
    - **这条正是「权限变更后的旧连接」的证据**。
3. `replays buffered messages and still enforces the write ACL`
    - `pendingMessages` 传入早到的读请求 → 回放后正常回包、不关闭；
    - `pendingMessages` 传入早到的写包且 `canWrite=false` → `closeCode === 4003`，房间内容仍为空。
    - **这条锁住「早到消息也必须走 ACL」这一 §3.8 的行为**。

### 6.2 `apps/frontend/web/test/selection-rewrite.test.tsx` —— AI 选区改写（3 tests ✅）

1. 预览结果、关闭后文档不变（`dispatch` 未被调用）；
2. 确认后**只替换选中区间**：断言 `insertText('新文', 1, 3)` 且 `dispatch('replacement-transaction')`；同时断言请求参数 `{ pageId, action: 'shorten', text: '原文' }`；
3. **生成期间文档变化 → 结果作废**：断言出现「重新选择文本」提示、不渲染过期结果、不 dispatch。

### 6.3 `apps/frontend/web/e2e/collaboration-real.spec.ts` —— 双账号 E2E（1 passed ✅）

单条用例覆盖：注册两账号 → owner 建页 → 邀请 member 为 editor → 两浏览器上下文双向写入互见 → owner 把 member 降权为 viewer → 断言前端只读三连（标题 readonly、`.bn-editor` `contenteditable=false`、无「发表评论」按钮）→ **绕过前端直接开裸 WebSocket 发写包，断言 `closeCode === 4003` 且 owner 端内容未被污染**。

### 6.4 `apps/backend/server/test/doc-yjs-gateway.test.ts` —— WS 升级路由与 ACL（9 tests ✅）

用真实 `JwtService` 签发 token、真实 `WsAdapter` + `app.listen(0)` 起临时端口、真实 `ws` 客户端连接，覆盖：

1. `parsePageIdFromRoom` 从 `miaoma-doc-{pageId}` 提取 pageId；非法形状（`random`、`doc-yjs/random`、空串、null）返回 null。
2. `/doc-yjs?room=..&token=invalid-token` → 升级成功且网关鉴权拒绝，`close` 4001。
3. 旧房间子路径 `/doc-yjs/miaoma-doc-abc123?token=..` → 升级阶段 `error`（锁定缺陷形状，防止回退到路径房间）。
4. 裸路径 `/doc-yjs` → 可升级，无效 token → 4001。
5. 缺 `room` / `room` 非法（`random`）→ 4002。
6. 无 read 权限 → 4003，且断言 `assertAction(pageId, userId, read)` 的实参为 `abc123` / `1` / `read`。
7. viewer 有 read 权限 → 连接被接受，且 `docs.has(doc-yjs/miaoma-doc-abc123)` 为 true（证明持久化 key 未变形状）。

**注意**：Vitest/esbuild 不生成 `design:paramtypes` 元数据，因此网关构造函数必须显式写 `@Inject(JwtService)` / `@Inject(UserService)` / `@Inject(PageAccessService)`，否则 `Test.createTestingModule` 注入后 `this.jwtService` 为 `undefined`。生产构建（`nest build`）不受影响，但显式 `@Inject` 语义等价、无副作用。

### 6.5 命令与结果速查（2026-09-24 19:24–20:36 复跑）

| 命令                                                | 结果                 | 备注                                                                                                                       |
| --------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @miaoma-doc/server test:unit`        | ✅ EXIT=0            | 12 files：11 passed + 1 skipped（opt-in 真实调用，设计预期）；58 passed + 1 skipped                                        |
| `pnpm --filter @miaoma-doc/server test:integration` | ✅ EXIT=0            | 10 files / 60 tests passed，**0 skipped**；串行执行                                                                        |
| `RUN_AI_REAL_TESTS=1` + `ai-real-call.test.ts`      | ⚠️ EXIT=1（blocked） | 早前 1 passed（`elapsedMs≈2254`、`length≈21`）；20:33 复跑命中上游 429 `AccountQuotaExceeded`，22:50:29 重置               |
| `pnpm gate:apps`                                    | ✅ EXIT=0            | lint + typecheck + 单测；web 8 files / 49 tests；PowerShell 会把 stderr 标成 NativeCommandError，需用 `$LASTEXITCODE` 判定 |
| `pnpm contract:apps`                                | ✅ EXIT=0            | 两份契约 lint + typegen + contract test 全过（各 2 tests）                                                                 |
| §6.5 方舟真实调用复跑                               | ✅ 用户本地通过      | 用户反馈同一 PowerShell 窗口执行后显示 `pass`；代理进程此前因环境隔离无法复跑。                                            |
| `pnpm build`                                        | ✅ EXIT=0            | turbo `5 successful, 5 total`；同样需用 `$LASTEXITCODE` 判定，不能看 PowerShell 的 NativeCommandError                      |
| 双账号真实 E2E                                      | ✅ 1 passed，EXIT=0  | 见 §5.2：15.4s（17:13），含裸 WS 4003 断言                                                                                 |
| web 协同测试（无 env）                              | ✅ 6 skipped，EXIT=0 | 见 §5.2                                                                                                                    |

**集成测试前置环境**（本机 Docker 未运行时，走原生 PostgreSQL 服务）：

```powershell
$env:PG_HOST='127.0.0.1'; $env:PG_PORT='5432'; $env:PG_USER='postgres'; $env:PG_PASSWORD='root'; $env:PG_DATABASE_TEST='miaoma_test'
```

**真实调用复跑方式**（密钥只从环境变量读取，绝不回显）：

```powershell
$env:AI_API_BASE_URL='https://ark.cn-beijing.volces.com/api/coding/v3'
$env:AI_MODEL='deepseek-v4.1-flash'
$env:AI_API_KEY=(Get-Content -LiteralPath '.env' -Raw -Encoding UTF8).Trim()
$env:RUN_AI_REAL_TESTS='1'
pnpm --filter @miaoma-doc/server exec vitest run --config vitest.config.mjs test/ai-real-call.test.ts
```

## 7. 待办（按建议顺序）

0. ~~**修复 §5.4 的 WS 升级路由缺陷**~~ —— **已完成（2026-09-24 15:43，方案 A）**。已改客户端为 query room + `disableBc: true`、服务端 `resolveWsRoom` / `parsePageIdFromRoom` 从 query 解析并显式传 `docName`、同步改 `e2e/collaboration-real.spec.ts` 的裸 WS 地址、确认 `src/mocks/mock-server.ts` 无真实 WS 处理无需改。回归守卫为 `test/doc-yjs-gateway.test.ts`（9 tests 通过）。
1. ~~**补 `test/ws-room-acl.test.ts`**~~ —— **已完成**：占位文件已删除，真实断言并入 `test/doc-yjs-gateway.test.ts`（用真实 `parsePageIdFromRoom` + 真实 Nest `WsAdapter` 升级过程 + `assertAction` 调用断言）。
2. ~~**修复集成测试装配 + 打通测试库**~~ —— **已完成（2026-09-24 19:24）**：新增 `test/integration/support/` 共享装配（显式实体数组 + `_test` 库名安全断言 + 表清理），补齐 provider 与 `forFeature`，`vitest.config.mjs` 改为 tsc 预转换以保留装饰器元数据，`test:integration` 加 `--no-file-parallelism`。结果 10 files / 60 tests passed / 0 skipped。本机 Docker 未运行，改用原生 PostgreSQL 服务 5432 + `miaoma_test`。详见 §5.1。
3. ~~**打通 E2E**~~ —— **已完成（2026-09-24 17:01，17:13 重建后复跑）**：`collaboration-real.spec.ts` 1 passed (15.4s)，双账号同步、降权只读、裸 WS 4003 全部取得端到端证据。打通过程修复 §3.5–3.8 四处既有缺陷。复跑命令与 env 见 §5.2。
4. **方舟真实调用**（§5.3）：**已取得可复现的分层证据**（20:36）。`/api/coding/v3/models` 200 证明 key 与通道可用，不存在的模型返回 404 `UnsupportedModel` 证明模型校验生效；Chat 调用被账号 5 小时配额挡住，返回 429 `AccountQuotaExceeded`，于 `2026-09-24 22:50:29 +0800` 重置。早前同一配置曾 1 passed（`elapsedMs≈2254`、`length≈21`）。配额重置后按 §6.5 命令复跑即可；失败时按错误码如实记录，**不记录密钥、不伪造通过**。
5. ~~**收尾门禁**~~ —— **已完成（2026-09-24 19:24–20:33 复跑）**：`test:unit`、`test:integration`、`gate:apps`、`contract:apps`、`build` 全 EXIT=0；双账号 E2E 1 passed。仅方舟 Chat 调用因账号配额 blocked（非门禁失败）。详见 §6.5；§3.1–3.8 的修复未被回退。

---

## 8. 接手注意事项

1. 先 `git status --short`，**保留原有未提交改动**。本任务起点就已有 README、AGENTS、CLAUDE 及多个无关文件改动；工作区还有 `.cursor/`、`bili_requests.txt`、`playurl89.json` 等无关未跟踪文件。
2. 后台跑长命令**不要接管道**（`| tail`），改用 `> /tmp/xxx.log 2>&1`，否则看不到中间输出（§3.3 的排错经验）。
3. 契约文件改动后必须重跑 `pnpm contract:apps`，它会重写 `src/types/openapi*.generated.ts`；这两个文件**不要手工编辑**，也不要因为它们显示为 modified 而误改。
4. 数据库相关命令**只对独立测试库**执行；不要对开发库/生产库跑 migration 或清理。
5. Windows 工作树下 Git 会提示 `LF will be replaced by CRLF`，属正常现象；`.prettierrc` 已设 `endOfLine: "auto"` 以兼容。
