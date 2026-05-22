# 协同文档项目文档

# 1. 需求背景介绍

## 1.1 需求背景

-   在企业级场景中，文档系统不只是一个富文本编辑器，还需要承担知识沉淀、多人协作、跨文档引用、权限控制、搜索发现、评论沟通、数据持久化和生命周期治理等职责。
-   飞书文档、Notion 等产品已经验证了协同文档的价值，但很多企业仍然希望掌握可私有化部署、可定制扩展、可深度集成内部系统的文档平台能力。
-   因此，这个项目的目标不是只做一个“富文本协同 Demo”，而是搭建一套具备企业协同文档雏形的完整方案，并围绕“协同编辑 + 文档治理 + 工程化落地”持续演进。

## 1.2 项目概述

-   项目名称：`miaoma-docs`
-   项目定位：一个基于 Monorepo 组织的协同文档系统，包含编辑器内核、React 适配层、UI 套件、Web 前端、NestJS 后端和桌面端壳，当前已经从基础协同编辑 Demo 演进到带权限、评论、通知、搜索、标签、模板、快照、回收站、AI 服务端代理、契约测试和扩展质量门禁的文档系统雏形。
-   核心能力：富文本编辑、实时协同编辑、文档列表管理、文档引用关系图谱、自定义块扩展、成员权限管理、评论与 `@` 提醒、搜索与标签、模板复用、快照恢复、回收站、AI 代理和协同数据持久化。
-   技术主线：前端以 `React + Vite + React Router + React Query` 为主，编辑器基于 `Tiptap + ProseMirror`，协同层基于 `Yjs + y-websocket`，服务端基于 `NestJS + TypeORM + PostgreSQL`，工程层通过 `pnpm workspace + Turborepo + Vitest + Playwright + OpenAPI contract` 支撑质量门禁。

## 1.3 项目技术栈

```text
React 18 + TypeScript + Vite + React Router + React Query + Axios
Tiptap + ProseMirror + Yjs + y-websocket + y-postgresql
NestJS + TypeORM + PostgreSQL + Passport + JWT + bcryptjs + ScheduleModule
Tailwind CSS + Radix UI + shadcn 风格组件 + Lucide React
Vitest + Playwright + OpenAPI contract + Turborepo + pnpm workspace + Docker Compose
```

解析：前端负责页面编排、状态缓存、编辑器接入和 Mock/契约演示；后端负责真实业务 API、认证、权限、协同网关、搜索索引和生命周期任务；协同正文走 Yjs 更新表，页面标题、权限、标签、评论等元数据走业务表。

## 1.4 项目职责

-   编辑器内核：负责 `packages/core` 的 Schema、块系统、命令系统和扩展机制，支撑 mention、AI block 等业务扩展接入。
-   React 适配：负责 `packages/react` 的编辑器 Hook、视图组件、菜单控制器和 React 运行时接入，使核心编辑器能力可被业务页面复用。
-   UI 套件：负责 `packages/shadcn` 和 `packages/shadcn-shared-ui` 的工具栏、菜单、Toast、Button、Input、Sidebar 等界面能力，保证编辑器 UI 与业务 UI 共用基础组件。
-   Web 业务：负责登录、文档列表、文档详情、ACL、评论、搜索、通知、回收站、图谱、审计、治理、可观测和 SSO 实验室等页面承载。
-   协同链路：负责在文档详情页创建 `Y.Doc` 与 `WebsocketProvider`，通过 `/doc-yjs` 连接服务端，并同步 awareness 在线状态。
-   后端治理：负责 NestJS 认证、页面 CRUD、ACL、标签、模板、快照、回收站、搜索索引、评论通知、AI 代理、协同网关和定时任务。
-   工程门禁：负责 `pnpm gate:apps`、`pnpm contract:apps`、`pnpm gate:extended` 三层质量检查，覆盖 lint、typecheck、单测、契约、协同专项和 E2E。

## 1.5 核心业务需求

# 1. 提供完整的富文本编辑能力。

-   支持段落、标题、列表、代码块、表格等基础块级能力。
-   支持工具栏、侧边菜单、建议菜单、自定义 mention 和 AI block 等扩展点。

# 2. 支持多人实时协同编辑。

-   多用户同时编辑同一文档时，需要保证内容最终一致。
-   需要支持在线状态、远程用户信息、协作感知和服务重启后的状态恢复。

# 3. 支持文档之间的结构化引用与知识图谱。

-   用户可以在文档中通过 mention 引用其他页面。
-   系统可以根据引用关系生成文档关系图谱，帮助知识可视化导航。

# 4. 支持文档级权限控制与成员协作。

-   文档需要支持 `owner / editor / commenter / viewer` 四类基础角色。
-   需要支持分享、成员管理、删除、恢复、评论管理、模板管理等操作位控制。

# 5. 支持评论沟通与通知提醒。

-   用户可以围绕文档内容发起评论、回复评论、标记解决和删除评论。
-   当评论里提及其他用户时，系统需要生成通知并提供通知中心入口。

# 6. 支持搜索、标签与模板复用。

-   用户需要按标题、正文和标签搜索自己可访问的文档。
-   系统需要支持标签管理、模板管理，以及“从页面生成模板”“从模板创建页面”两条复用链路。

# 7. 支持快照、回收站与生命周期治理。

-   页面删除不能直接物理删除，而是先进入回收站，支持恢复和永久删除。
-   协同文档需要支持手动快照、恢复前自动备份和过期数据清理。

# 8. 支持私有化部署与安全接入。

-   页面元数据、权限数据、评论通知、模板快照和协同编辑数据都需要保存到企业可控的 PostgreSQL 中。
-   AI 能力需要通过服务端代理接入，避免把 `DIFY_API_KEY` 暴露到前端产物。

## 1.6 技术需求

-   编辑器内核要有清晰的 Schema 设计、命令系统和扩展机制。
-   协同层要支持低延迟同步、冲突自动合并、断线重连、WebSocket 鉴权和 PostgreSQL 持久化。
-   服务端要同时支持 REST API、WebSocket 协同通道、定时任务和基于 migration 的数据库演进。
-   前端要支持页面路由、接口请求、服务端状态缓存、权限页面、评论通知、搜索发现、图谱可视化和 Mock 模式。
-   工程层要支持 Workspace、统一构建、跨包复用、本地联调、基础自动化测试、契约校验和环境变量配置。

# 2. 学习成果

# 1. 需求分析与架构设计能力。

-   能够理解企业级协同文档系统从“编辑器”向“文档治理平台”演进时新增的业务需求和技术需求。
-   能够从“编辑器内核、React 适配、UI 套件、Web 应用、后端服务、协同持久化、工程门禁”七层拆解系统架构。

# 2. 富文本编辑器实现能力。

-   理解 `ProseMirror` 的文档模型与编辑器状态管理方式。
-   理解 `Tiptap` 在 `ProseMirror` 之上的扩展封装方式。
-   能够看懂并分析 `MiaomaDocEditor`、`MiaomaDocSchema`、默认块定义、命令系统与自定义扩展接入方式。

# 3. 实时协同与鉴权实现能力。

-   理解 `Yjs` 的 CRDT 思路以及为什么它适合做多人协同。
-   理解客户端 `Y.Doc`、`WebsocketProvider`、服务端同步网关、`y-postgresql` 持久化和 WS Token 鉴权之间的关系。

# 4. 权限模型与文档治理能力。

-   能够理解文档成员、角色、操作位、权限判断和接口保护是如何组织起来的。
-   能够分析 ACL、评论、通知、回收站、快照、模板等治理能力如何围绕页面主实体展开。

# 5. 搜索、标签与数据加工能力。

-   能够理解搜索索引不是手写一份独立内容，而是从 Yjs 文档和标签数据中反向提取、加工并落库。
-   能够理解定时任务、索引入队、全文检索和回收站清理之间的协作关系。

# 6. 全栈开发与工程化能力。

-   能够串联 `React + React Router + React Query + NestJS + TypeORM + PostgreSQL` 的整条业务链路。
-   能够理解 `Vitest`、`Playwright`、`OpenAPI contract`、`TypeORM migration`、环境变量、定时任务和 Monorepo 分层在真实项目中的意义。

# 7. 可视化与扩展能力。

-   能够理解文档引用关系图谱是如何从 mention 数据中提取出来的。
-   能够理解自定义 mention、AI block、评论区、分享入口、搜索页、审计页和可观测页等能力是如何接入到现有体系中的。

# 3. 学习产物

# 1. 企业级协同文档编辑器。

-   基于 `Tiptap + ProseMirror + Yjs` 实现的协同文档编辑器。
-   支持文档列表、文档详情、实时协同、引用链接、关系图谱、评论区和分享入口。

# 2. 编辑器基础 SDK。

-   `@miaoma-doc/core` 提供编辑器 Schema、命令系统、块定义和导入导出能力。
-   `@miaoma-doc/react` 提供 React 接入能力和 UI 控制器。

# 3. UI 套件与共享组件。

-   `@miaoma-doc/shadcn` 提供编辑器 UI 皮肤。
-   `@miaoma-doc/shadcn-shared-ui` 提供项目级共享 UI 组件。

# 4. 文档治理能力集合。

-   支持文档 ACL、成员邀请、操作位管理、评论与 `@` 提醒、通知中心、回收站、标签、模板和快照。
-   支持从模板创建文档、从页面生成模板，以及快照恢复前自动备份。

# 5. 后端服务模块。

-   `@miaoma-doc/server` 提供用户认证、页面管理、图谱接口、搜索接口、标签接口、模板接口、评论接口、通知接口、AI 代理和文档协同 WebSocket 网关。
-   协同数据通过 `y-postgresql` 保存到 PostgreSQL，业务表同时承载页面、成员、评论、通知、模板、标签、快照与搜索索引。

# 6. 契约与 Mock 演示体系。

-   `docs/openapi/miaoma-docs-mock-openapi.yaml` 定义前端 Mock 与契约测试使用的 OpenAPI。
-   前端 `VITE_API_MODE=mock` 时由 `src/mocks/mock-server.ts` 承载审计、治理、可观测、SSO 等演示接口。

# 7. 工程化与测试基础。

-   后端支持 `migration:run`、`migration:revert`、`migration:generate`、`lint`、`typecheck`、`test` 等脚本。
-   前端补充了 unit、contract、collab、e2e 测试入口，CI 主门禁与扩展门禁分层执行。

# 4. 技术选型

## 4.1 工程与质量基建（Infrastructure & QA）

-   构建与包管理：采用 `pnpm workspace + Turborepo` 组织 `apps/*` 与 `packages/*`，统一编排 build、dev、typecheck 和缓存。
-   开发语言：全仓使用 TypeScript，前端、后端、编辑器内核和 OpenAPI 类型生成保持统一类型体系。
-   质量保障：引入 `Vitest` 覆盖后端服务、前端工具函数、契约和协同专项测试，引入 `Playwright` 覆盖关键端到端流程。
-   数据库演进：后端关闭 TypeORM `synchronize`，通过 migration 创建和演进业务表。
-   可观测性：提供 GET /api/health 健康检查、GET /api/metrics Prometheus 指标、JSON 格式日志输出和协同房间连接数 gauge。
-   安全基座：helmet HTTP 头、显式 CORS 配置、启动前 zod 校验必填环境变量、全局 ThrottlerModule 限流。

## 4.2 编辑器核心架构（Editor Core Architecture）

-   编辑器内核：`@miaoma-doc/core` 负责 Schema、block/inline/style 能力、命令系统、扩展机制、HTML/Markdown 转换。
-   React 适配：`@miaoma-doc/react` 负责 `useCreateMiaomaDoc`、`MiaomaDocViewRaw`、SuggestionMenu、FormattingToolbar、LinkToolbar 和 SideMenu。
-   UI 皮肤：`@miaoma-doc/shadcn` 基于 Tailwind、Radix UI 和 shadcn 风格组件输出实际业务使用的 `MiaomaDocView`。
-   共享组件：`@miaoma-doc/shadcn-shared-ui` 提供 Button、Input、Popover、Sidebar、Toast、Avatar 等基础组件。

## 4.3 协同与持久化引擎（Collaboration Engine）

-   协同协议：基于 `Yjs` 的 CRDT 模型处理多人并发编辑和最终一致性。
-   连接通道：前端使用 `y-websocket` 的 `WebsocketProvider` 连接 `/doc-yjs`。
-   服务端网关：NestJS `DocYjsGateway` 在进入 `setupWSConnection` 前完成 JWT 鉴权。
-   持久化：`y-postgresql` 将 Yjs update 落入 PostgreSQL，服务重启后可通过历史 update 恢复状态。

## 4.4 Web 应用架构（Web Application）

-   前端框架：`React 18 + Vite`，负责 SPA 页面渲染和本地开发体验。
-   路由管理：`React Router` 组织 `/doc`、`/doc/:id`、`/doc/:id/acl`、`/doc/graph`、`/search`、`/notifications`、`/trash`、`/audit`、`/governance`、`/observability`、`/sso-lab`、`/account/login`。
-   服务端状态：`React Query` 负责页面详情、文档列表、当前用户、通知、搜索等请求缓存与失效刷新。
-   请求封装：`Axios` 统一 `baseURL=/api`、Bearer Token 注入、401 跳转登录页，并支持 `VITE_API_MODE=mock` 切换 Mock adapter。

## 4.5 Server 业务架构（NestJS Server）

-   后端框架：`NestJS` 组织认证、用户、页面、评论、通知、标签、模板、搜索、AI、任务和协同模块。
-   数据访问：`TypeORM + PostgreSQL` 承载页面元数据、成员、评论、通知、标签、模板、快照、搜索索引和 Yjs 更新。
-   鉴权体系：`Passport + JWT + bcryptjs` 负责登录、密码哈希校验、HTTP Bearer 鉴权和 WS token 校验。
-   定时任务：`ScheduleModule` 每 30 秒处理搜索索引队列，每天凌晨 3 点清理过期快照与回收站数据。

## 4.6 可视化、契约与扩展能力（Visual & Contract）

-   图谱渲染：`@xyflow/react + d3-force` 承载文档节点、引用边和力导向布局。
-   OpenAPI 契约：`openapi-typescript + swagger-parser + Vitest contract` 保障前端 Mock 接口与契约定义一致。
-   Mock 演示：`src/mocks/mock-server.ts` 在前端本地模拟审计、治理、SSO、可观测和业务状态流转。
-   扩展质量门禁：`gate:extended` 执行协同专项测试和 Playwright E2E，适合 nightly 或手动触发。

# 5. 系统架构设计

## 5.1 宏观架构策略

### 5.1.1 架构定位

考虑到企业内部文档系统既要有富文本编辑体验，又要承载权限、评论、搜索、模板、快照、回收站和私有化部署要求，项目采用 Monorepo 分层架构。核心目标不是为某个页面单独写编辑器，而是围绕“编辑器内核、协同同步、文档治理、业务页面、工程门禁”构建可持续扩展的协同文档平台。

### 5.1.2 分层建设思路

项目把编辑能力、React 接入、UI 皮肤、业务页面和后端治理拆开。`packages/core` 负责底层文档模型，`packages/react` 负责运行时适配，`packages/shadcn` 负责 UI 皮肤，`apps/frontend/web` 负责编排业务场景，`apps/backend/server` 负责真实业务规则和数据持久化。这样可以避免编辑器内核被业务页面污染，也方便后续桌面端或其他前端复用。

### 5.1.3 协同与治理解耦策略

正文内容以 Yjs update 为主，通过 WebSocket 实时同步并由 PostgreSQL 持久化；页面标题、权限、标签、评论、通知、模板、快照和搜索索引则走后端业务表。这个边界让在线编辑链路和文档治理链路互不挤压，也方便搜索、快照、回收站等能力围绕同一份文档状态独立演进。

## 5.2 整体架构

```text
浏览器 Web 应用
├─ HTTP /api/** -> NestJS Server -> PostgreSQL 业务表
├─ WS /doc-yjs?token=... -> DocYjsGateway -> y-postgresql -> PostgreSQL 协同更新表
├─ React Query + Router -> Doc / ACL / Search / Notifications / Trash / Graph / Audit / Governance / Observability / SsoLab
├─ VITE_API_MODE=real -> 请求真实后端 API
└─ VITE_API_MODE=mock -> 请求前端 Mock adapter + OpenAPI 契约演示
ScheduleModule -> TasksService -> 搜索索引队列 + 过期快照/回收站清理
packages/core -> packages/react -> packages/shadcn -> apps/frontend/web
packages/shadcn-shared-ui -> packages/shadcn + apps/frontend/web
apps/frontend/desktop -> 复用 Web 能力做桌面端壳
```

解析：架构核心是两条数据线并行。HTTP 处理业务元数据和治理能力，WebSocket 处理协同正文同步；Mock/契约能力主要服务前端演示和接口一致性验证，不等同于 NestJS 后端已实现的真实控制器。

## 5.3 Monorepo 分层关系

# 1. apps 层负责最终运行形态。

-   `apps/frontend/web` 是主 Web 客户端，承载文档编辑、权限、搜索、通知、回收站、图谱、审计、治理、可观测和 SSO 实验室页面。
-   `apps/backend/server` 是主业务服务端，承载 API、协同、AI 代理、定时任务和 migration。
-   `apps/frontend/desktop` 是 Tauri 桌面端壳。
-   `apps/backend/y-websocket-server-demo` 是 y-websocket 对照演示服务。

# 2. packages 层负责可复用能力沉淀。

-   `packages/core` 负责编辑器内核。
-   `packages/react` 负责 React 适配。
-   `packages/shadcn` 负责编辑器 UI 皮肤。
-   `packages/shadcn-shared-ui` 负责共享业务组件。

# 3. 依赖方向保持单向。

-   `web` 依赖 `core/react/shadcn/shared-ui`。
-   `react` 依赖 `core`。
-   `shadcn` 依赖 `core + react`。
-   `server` 独立提供业务与协同能力，不直接依赖前端 UI 包。

## 5.4 前端模块关系

# 1. 路由层。

-   `src/router/index.tsx` 负责组织 `/doc`、`/doc/:id`、`/doc/:id/acl`、`/doc/graph`、`/search`、`/notifications`、`/trash`、`/audit`、`/governance`、`/observability`、`/sso-lab`、`/account/login`。
-   `src/router/AuthRoute.tsx` 负责登录态拦截。

# 2. 布局层。

-   `src/layout/index.tsx` 注入 Sidebar 布局和页面 Outlet。
-   `src/components/LayoutAside/*` 负责文档入口、搜索入口、通知入口、回收站入口、审计入口和用户操作区。

# 3. 页面层。

-   `DocList` 负责文档列表、新建文档和模板入口。
-   `Doc` 负责文档详情、标题编辑、协同连接、评论区、分享入口和权限入口。
-   `DocAclPage` 负责成员邀请、角色切换和操作位配置。
-   `SearchPage` 负责标题/正文/标签搜索与结果跳转。
-   `NotificationsPage` 负责通知列表、单条已读和全部已读。
-   `TrashPage` 负责软删除页面的恢复与永久删除。
-   `DocGraph` 负责文档关系图谱可视化。
-   `AuditPage`、`GovernancePage`、`ObservabilityPage`、`SsoLabPage` 负责契约/Mock 演示场景。

# 4. 服务与状态层。

-   `src/services/page.ts` 负责页面、回收站、ACL、标签、快照相关接口。
-   `src/services/comment.ts`、`notification.ts`、`search.ts`、`tag.ts`、`template.ts`、`ai.ts` 负责治理类接口。
-   `src/services/audit.ts`、`governance.ts`、`observability.ts`、`sso.ts` 主要对应 Mock/OpenAPI 演示接口。
-   `request.ts` 统一注入 `Authorization: Bearer` 请求头，并在 401 时跳转登录页。

# 5. 编辑器接入层。

-   `Doc/index.tsx` 创建 `Y.Doc`、`WebsocketProvider`，把 token 透传给 `/doc-yjs`，并维护远程用户 awareness。
-   `DocEditor.tsx` 把 Yjs fragment、编辑器 Schema、mention、AI block 和 SuggestionMenu 连接起来。

## 5.5 后端模块关系

# 1. 启动与装配层。

-   `main.ts` 负责应用创建、全局异常处理、WebSocket adapter、Swagger 和服务器启动。
-   `app.module.ts` 负责装配 `AuthModule`、`UserModule`、`ApplicationModule`、`DocYjsModule`、`PageModule`、`TagModule`、`TemplateModule`、`SearchModule`、`NotificationModule`、`CommentModule`、`AiModule`、`TasksModule`、`YjsPostgresqlModule`。

# 2. 认证层。

-   `auth` 模块负责用户名密码登录、JWT 签发、当前用户查询和 Bearer Token 校验。
-   `user` 模块负责注册、用户列表、密码哈希与密码校验。

# 3. 文档治理与业务层。

-   `page` 模块负责页面创建、更新、查询、图谱、回收站、ACL、标签、快照、搜索索引入队等核心能力。
-   `page-access.service.ts` 负责成员、角色、操作位和 `assertAction()` 统一鉴权。
-   `comment` 模块负责评论线程、解决状态、删除逻辑和 `@` 提醒。
-   `notification` 模块负责通知中心读取与已读状态更新。
-   `tag`、`template`、`search` 模块分别负责标签管理、模板复用和全文搜索入口。
-   `ai` 模块负责 AI 代理调用、限流和审计日志。

# 4. 协同层。

-   `doc-yjs.gateway.ts` 负责 WebSocket 连接接入，并在进入 `setupWSConnection` 前完成 WS 鉴权。
-   `ws-auth.ts` 负责从 query token 或 `Authorization` 请求头解析并验证 token。
-   `fundamentals/yjs-postgresql` 负责 Yjs update 的 PostgreSQL 保存、状态恢复、清空和重建。

# 5. 支撑层。

-   `tasks.service.ts` 通过 `@Cron` 定时处理搜索索引任务和过期数据清理。
-   `migrations/*` 负责数据库结构演进。
-   `test/*` 负责密码、ACL、WS 鉴权等基础测试。
-   undamentals/observability/\* 负责健康检查、Prometheus 指标采集和 JSON 结构化日志。
-   undamentals/security/env.validation.ts 负责启动前环境变量 zod 校验。

## 5.6 核心数据流转

### 5.6.1 登录与鉴权链路

# 1. 前端登录页提交用户名和密码。

# 2. 注册时后端通过 `bcryptjs` 进行密码哈希；登录时由 `LocalStrategy -> AuthService -> UserService -> verifyPassword` 校验口令。

# 3. 登录成功后返回 JWT，前端保存到 `localStorage`。

# 4. 后续 HTTP 请求由 `request.ts` 自动把 token 写入 `Authorization: Bearer xxx` 请求头。

# 5. WebSocket `/doc-yjs` 同样通过 query token 或 `Authorization` 请求头完成鉴权。

```ts
request.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
```

解析：HTTP 鉴权入口被收敛在请求封装里，页面层不需要每次手动拼请求头；401 统一跳转登录页，避免多个业务页面重复处理登录失效。

### 5.6.2 文档列表、详情与标题编辑链路

# 1. 前端通过 `fetchPageList`、`fetchPageDetail` 请求页面数据。

# 2. 页面标题在 `Doc/index.tsx` 中本地输入、debounce 更新，再经 `updatePage` 写回服务端。

# 3. React Query 负责缓存、失效和页面刷新。

# 4. 后端更新标题后触发搜索索引入队，使标题变更最终进入搜索结果。

### 5.6.3 协同编辑链路

# 1. 文档页初始化时创建 `Y.Doc` 和 `WebsocketProvider`。

# 2. 前端按页面 ID 创建 room：`miaoma-doc-${pageId}`。

# 3. 编辑器把当前文档绑定到 `doc.getXmlFragment('document-store-${pageId}')`。

# 4. 用户输入后产生 Yjs update。

# 5. 服务端通过 `setupWSConnection` 广播 update 并写入 PostgreSQL。

# 6. 新用户加入或服务重启后，通过历史 update 回放恢复文档状态。

```ts
const provider = new WebsocketProvider(`${wsProtocol}://${wsHost}:${wsPort}/doc-yjs`, roomName, doc, {
    connect: false,
    params: token ? { token } : {},
})
const editor = useCreateMiaomaDoc({
    schema,
    dictionary: locales.zh,
    collaboration: {
        provider,
        fragment: doc.getXmlFragment(`document-store-${pageId}`),
        user: { name: currentUser?.username ?? '', color: randomColor },
        renderCursor: cursorRender,
    },
})
```

解析：`roomName` 决定多人进入同一个协同房间，`XmlFragment` 决定编辑器正文绑定到哪份 Yjs 数据，`provider.awareness` 决定远程用户状态与光标感知。

### 5.6.4 WS 鉴权链路

# 1. `DocYjsGateway` 接到连接后先调用 `resolveWsToken()`。

# 2. token 可以来自 query 参数，也可以来自 `Authorization: Bearer` 请求头。

# 3. token 校验失败、payload 缺失或用户不存在时，服务端关闭连接，关闭码为 `4001`。

# 4. 鉴权成功后才进入 `setupWSConnection()`。

```ts
async handleConnection(connection: WebSocket, request: IncomingMessage) {
    const token = resolveWsToken(request)
    if (!token) {
        connection.close(4001, 'Unauthorized')
        return
    }
    const payload = verifyWsToken(this.jwtService, token)
    const user = await this.userService.findById(payload.sub)
    if (!user) {
        connection.close(4001, 'Unauthorized')
        return
    }
    setupWSConnection(connection, request)
}
```

解析：协同通道不能默认匿名开放，否则任何拿到 room 名称的人都可能连接编辑。这里把鉴权前置到同步协议之前，降低协同数据泄露风险。

### 5.6.5 文档权限与成员管理链路

# 1. 页面创建成功后，`PageAccessService.createOwnerMember()` 自动为创建者建立 owner 成员关系。

# 2. 文档 ACL 页通过 `/page/:pageId/acl`、`/page/:pageId/members/invite`、`/page/:pageId/members/:userId` 管理成员。

# 3. 服务端通过 `assertAction()` 统一判断当前用户是否拥有 `read / write / comment / member_manage / invite_user` 等能力。

```ts
export const DOC_ROLES = ['owner', 'editor', 'commenter', 'viewer'] as const
export const DOC_OPERATIONS = [
    'share',
    'member_manage',
    'delete',
    'restore',
    'export',
    'comment_moderate',
    'template_manage',
    'invite_user',
] as const
const roleActionMap = {
    owner: new Set([
        'read',
        'write',
        'comment',
        'share',
        'member_manage',
        'delete',
        'restore',
        'export',
        'comment_moderate',
        'template_manage',
        'invite_user',
    ]),
    editor: new Set(['read', 'write', 'comment']),
    commenter: new Set(['read', 'comment']),
    viewer: new Set(['read']),
}
```

解析：角色解决大多数人的默认能力，操作位解决特定用户的额外授权。这样比简单 owner/editor 二分更接近企业文档治理场景。

### 5.6.6 评论、`@` 提醒与通知链路

# 1. 前端评论区通过 `/page/:pageId/comments` 创建评论，并可附带 mention 用户信息。

# 2. 服务端 `CommentService` 保存评论后触发通知创建。

# 3. 通知中心通过 `/notifications` 获取通知列表和未读信息，并支持单条已读和全部已读。

# 4. 评论权限和评论管理权限分离：普通成员可以评论，具备 `comment_moderate` 能力的成员可以执行更强的治理动作。

### 5.6.7 搜索、标签与发现链路

# 1. 页面标题更新、标签更新、删除恢复、快照恢复等动作会通过 `enqueueSearchIndex()` 把搜索任务写入队列表。

# 2. 定时任务 `processPendingSearchJobs()` 从 Yjs 文档 XML 和标签关系中提取正文与标签文本。

# 3. 处理后的内容落入 `page_search_index`，`/search/pages` 基于 PostgreSQL FTS 查询用户可访问页面。

```ts
@Cron('*/30 * * * * *')
async processSearchIndexJobs() {
    const result = await this.pageService.processPendingSearchJobs(50)
    if (result.processed > 0) {
        this.logger.log(`[search-index] processed ${result.processed} jobs`)
    }
}
```

解析：搜索不是每次都扫描实时协同文档，而是通过异步索引把“在线编辑链路”和“查询检索链路”拆开，降低搜索对协同编辑主链路的影响。

### 5.6.8 模板与快照链路

# 1. “从页面生成模板”会读取当前 Yjs 文档更新，转成 base64 存入模板数据。

# 2. “从模板创建页面”会先创建页面，再把模板里的协同文档更新写回新页面的 Yjs room。

# 3. 手动创建快照时会保存当前 Yjs 状态。

# 4. 恢复快照前会自动生成一份 `before_restore` 保护快照。

### 5.6.9 回收站与数据生命周期链路

# 1. 删除页面时先走软删除，页面进入 `/page/trash`。

# 2. 用户可以在回收站恢复页面，或者执行永久删除，同时清理对应搜索索引和 Yjs 文档。

# 3. 定时任务 `cleanupExpiredData()` 会清理过期快照和超过保留期的软删除页面。

### 5.6.10 图谱链路

# 1. 前端插入 mention，其引用信息进入 Yjs XML 文档。

# 2. 后端读取 Yjs 文档对应 XML，提取 mention id。

# 3. `/page/graph` 返回页面节点和引用关系。

# 4. 前端利用 `d3-force` 计算布局，再由 `@xyflow/react` 渲染节点与边。

# 6. 核心实现与项目亮点

## 6.1 协同编辑与 WS 鉴权

-   客户端协同核心在 `apps/frontend/web/src/pages/Doc/index.tsx` 和 `apps/frontend/web/src/pages/Doc/DocEditor.tsx`。
-   服务端协同核心在 `apps/backend/server/src/modules/doc-yjs/doc-yjs.gateway.ts` 和 `apps/backend/server/src/fundamentals/yjs-postgresql/utils.ts`。
-   本项目没有采用传统 OT，而是基于 Yjs 的 CRDT 思路做同步与冲突合并。
-   `resolveWsToken + verifyWsToken` 让协同连接不再是匿名接入。
-   协同正文与业务元数据分开存储，业务表保存页面基础信息，Yjs 表保存协同增量更新。
    面试表达：这个项目里协同编辑的难点不只是把 WebSocket 连起来，而是要同时解决多人并发、远程感知、服务重启恢复和连接安全。我这里把正文交给 Yjs 处理冲突和最终一致性，服务端通过 `setupWSConnection` 处理同步协议，再用 `y-postgresql` 持久化 update；同时在进入同步协议之前加 JWT 校验，保证协同房间不是匿名开放。
    追问：为什么不用普通 WebSocket 自己同步文本？
    回答：普通 WebSocket 只能负责消息传输，不能解决多人并发编辑时的冲突合并。协同编辑需要一个能保证最终一致性的模型，Yjs 的 CRDT 能在多个客户端并发修改后自动合并，适合这种场景。
    追问：为什么协同正文和页面元数据分开存？
    回答：正文是高频、增量、协同型数据，适合用 Yjs update 存；标题、权限、标签、评论是业务型关系数据，适合关系表查询。分开后，协同同步、权限判断和搜索治理可以各自演进。

## 6.2 编辑器扩展机制

-   `DocEditor.tsx` 通过 `MiaomaDocSchema.create()` 合并默认块、默认 inline 能力、mention 和 AI block。
-   mention 用于跨文档引用，AI block 用于服务端代理 Dify 后生成结构化内容。
-   Slash menu 和 `@` SuggestionMenu 都是通过扩展点接入，没有直接修改编辑器核心类。
    面试表达：这个项目里编辑器扩展不是把业务逻辑硬写到页面里，而是在 Schema 层注册自定义 inline 和 block。mention 负责文档引用，AI block 负责智能生成入口，页面只负责传入当前 pageId、Yjs 文档和 provider。这样后续增加新的块类型或菜单项时，改的是扩展点，而不是重写编辑器主流程。
    追问：为什么要把 mention 做成 inline content？
    回答：mention 本质上是正文中的结构化引用，它既要显示标题和图标，又要在后端图谱解析时拿到 pageId。做成 inline content 可以跟正文一起进入 Yjs 文档，也方便从 XML 里反向提取引用关系。

## 6.3 权限模型与成员协作

-   文档权限模型抽象为“角色 + 操作位”两层。
-   当前角色为 `owner / editor / commenter / viewer`。
-   当前操作位包含 `share / member_manage / delete / restore / export / comment_moderate / template_manage / invite_user`。
-   `PageAccessService.assertAction()` 把页面读取、成员查询、权限判断和异常抛出收敛到一个入口。
-   前端 `DocAclPage` 直接对应这套模型，支持邀请成员、切换角色、勾选操作位和移除成员。
    面试表达：权限这块我没有只做 owner/editor 两类，而是拆成角色和操作位。角色负责默认能力，比如 editor 能读写评论；操作位负责更细的授权，比如某个用户是否能管理成员、恢复页面或管理模板。服务端统一通过 `assertAction()` 判断动作，避免每个接口重复写角色判断。
    追问：为什么不直接给角色加更多类型？
    回答：如果所有能力都靠角色表达，角色数量会越来越多，比如“可编辑但不可分享”“可评论但可管理评论”都会变成新角色。操作位可以把特殊授权从角色里拆出来，模型更稳定。

## 6.4 评论、`@` 提醒与通知中心

-   评论实体不只是文本，还包含回复、解决状态、隐藏/删除、mention 用户等协作信息。
-   评论创建后可触发 `@` 提醒通知，通知中心可以查看通知列表、未读状态、单条已读和全部已读。
-   评论权限和评论治理权限分离，`comment` 代表可参与讨论，`comment_moderate` 代表更强的评论管理能力。
    面试表达：评论通知的价值是把“协同编辑”扩展成“协作沟通”。文档不是只有正文修改，还需要围绕内容讨论、提醒相关人、处理未读和解决状态。所以我把评论、回复、mention 和通知中心连成闭环，让编辑行为和沟通行为都围绕同一份页面展开。
    追问：为什么通知不能只在前端临时提示？
    回答：因为通知需要跨页面、跨登录状态、跨时间保留。临时提示只能解决当前会话，服务端通知表才能支撑未读、已读、通知中心和后续审计。

## 6.5 搜索索引、标签与知识发现

-   搜索不是直接扫描实时文档，而是通过搜索任务把标题、正文纯文本、标签文本加工到索引表。
-   PostgreSQL FTS 负责查询，React SearchPage 负责展示结果。
-   标签不仅服务于页面归类，也参与搜索过滤和召回。
-   图谱页从 mention 关系出发，补充“搜索之外的知识发现入口”。
    面试表达：搜索这块我没有让查询接口每次直接读取完整 Yjs 文档，因为 Yjs 文档是协同状态，不适合高频查询。我的做法是页面变更时入队，定时任务异步提取正文和标签写入搜索索引表，然后搜索接口只查索引。这本质上是把在线编辑链路和查询链路解耦。
    追问：这样会不会有延迟？
    回答：会有短暂延迟，但这是可接受的最终一致性。换来的好处是搜索不会拖慢协同编辑主链路，也更容易做分页、排序和标签过滤。

## 6.6 模板、快照与回收站

-   模板能力保存 Yjs 文档更新，不只是复制页面标题等元数据。
-   快照能力复用 Yjs 状态编码，并在恢复前自动创建保护快照。
-   页面删除采用软删除优先，用户可在回收站恢复或永久删除。
-   `cleanupExpiredData()` 定时清理过期快照和软删除页面，形成基础生命周期管理。
    面试表达：模板、快照和回收站都围绕文档状态展开，但关注点不同。模板解决复用，快照解决回滚，回收站解决误删。这里我复用了 Yjs 状态编码能力保存模板和快照，并在恢复快照前自动备份当前状态，避免用户误恢复导致当前内容完全丢失。
    追问：为什么恢复前还要再建一个快照？
    回答：恢复是破坏性操作，如果直接覆盖当前状态，用户发现恢复错了就没法回去。恢复前创建 `before_restore` 快照，相当于给恢复操作加了一层回退保障。

## 6.7 AI 服务端代理

-   前端不保存 Dify 密钥，所有 AI 请求统一走 `POST /api/ai/chat`。
-   后端通过 `DIFY_API_KEY` 和 `DIFY_API_BASE_URL` 调用上游。
-   `AiService` 对单用户做窗口限流，默认每分钟最多 20 次。
-   AI 调用会输出审计日志，包含用户、IP 和 query 长度。

```ts
private readonly windowMs = 60_000
private readonly maxRequestPerWindow = 20
const baseUrl = process.env.DIFY_API_BASE_URL ?? 'https://api.dify.ai'
const apiKey = process.env.DIFY_API_KEY
this.logger.log(`[AI_AUDIT] userId=${user.id} username=${user.username ?? ''} ip=${ip ?? ''} queryLength=${payload.query.length}`)
```

解析：AI 能力通过后端代理接入，核心收益是密钥不下发前端、上游错误可统一处理、限流和审计可以集中在服务端完成。

## 6.8 契约、Mock 与扩展质量门禁

-   `VITE_API_MODE=mock` 时，`request.ts` 会把 Axios adapter 切换为 `handleMockRequest()`。
-   `docs/openapi/miaoma-docs-mock-openapi.yaml` 定义 Mock 接口契约。
-   `contract:apps` 执行契约 lint、类型生成和契约测试。
-   `gate:extended` 执行协同专项测试和 Playwright E2E，适合 nightly 或手动触发。

```ts
const apiMode = (import.meta.env.VITE_API_MODE ?? 'real').toLowerCase()
if (apiMode === 'mock') {
    config.adapter = async (requestConfig: InternalAxiosRequestConfig) => {
        const data = await handleMockRequest(requestConfig)
        return { data, status: 200, statusText: 'OK', headers: {}, config: requestConfig, request: {} }
    }
}
```

解析：Mock 模式不是简单假数据，而是让前端在后端能力未完全实现时也能演示审计、治理、SSO、可观测等流程，并通过 OpenAPI 契约保证请求/响应结构可校验。

## 6.9 Monorepo 分层与工程化能力

-   `core/react/shadcn/web/server` 的层次划分清晰，便于从底层能力到应用业务逐层理解项目。
-   后端具备 migration、定时任务、环境变量强约束和 Vitest 测试。
-   前端具备单测(7文件40用例)、契约测试、协同专项和 E2E 入口，后端具备单测(6文件15用例)和可观测性集成测试(3文件12用例)。
-   CI 主门禁跑后端 build/typecheck/lint/test、前端 typecheck/lint/unit test、契约 lint/typegen/test。
-   扩展门禁跑 `pnpm gate:extended`，覆盖协同与 E2E。

## 6.10 可观测性基座

-   健康检查：HealthController 提供 /api/health (liveness) 和 /api/health/ready (readiness)，后者用 @Optional() DataSource 实现无 DB 也能返回健康状态。
-   指标采集：MetricsController 基于 prom-client 暴露 /api/metrics，内置 histogram/counter/gauge，collabConnectionsActive 追踪协同连接数。
-   结构化日志：JsonLoggerService 实现 NestJS LoggerService，输出带 traceId 的 JSON 行日志，替换默认 Logger。
-   协同指标：DocYjsGateway 在鉴权成功后 collabConnectionsActive.inc()，断开时 .dec()，实时反映连接数。
    面试表达：可观测性不只是加几个端点，而是要在不加依赖数据库的前提下提供 readiness 判断，在协同时追踪连接数变化，在日志里统一 traceId 方便排查。Health 用 Optional DataSource 避免启动循环依赖，Metrics 用 prom-client 标准库对接 Prometheus，Logger 用 JSON 行输出方便 ELK 采集。

## 6.11 安全基座

-   环境校验：env.validation.ts 基于 zod schema 校验 JWT*SECRET(≥16位)、PG*\*、SERVER_PORT，启动前失败抛异常阻止启动。
-   HTTP 安全头：main.ts 注册 helmet() 中间件，防止 XSS、点击劫持等常见 Web 攻击。
-   CORS 显式配置：app.enableCors() 指定 origin/methods/credentials，避免默认全放开的隐患。
-   限流：ThrottlerModule.forRoot() 全局 100req/60s，AI 端点由 AiService 额外限流 20req/60s。
    面试表达：安全不能靠事后补，环境校验失败直接阻止启动（fail-fast），helmet 和 CORS 在 NestJS 创建后立即注册（first-class），限流分全局和业务两级（defense in depth）。密钥不下发前端（AI 走服务端代理），环境变量不靠可选读取（zod 强校验）。

# 7. 本地启动、脚本与排障

## 7.1 最小可跑路径

```bash
pnpm install
pnpm docker:start
pnpm --filter @miaoma-doc/server migration:run
pnpm dev:server
pnpm dev
```

解析：先启动 PostgreSQL，再执行 migration，最后分别启动后端和前端。后端默认端口 `8082`，HTTP API 前缀为 `/api`，Swagger 为 `/doc`。

## 7.2 后端环境变量

```env
JWT_SECRET=replace-with-strong-secret
PG_HOST=127.0.0.1
PG_PORT=5433
PG_USER=postgres
PG_PASSWORD=xiaoer
PG_DATABASE=postgres
SERVER_PORT=8082
DIFY_API_KEY=replace-with-dify-key
DIFY_API_BASE_URL=https://api.dify.ai
```

解析：`JWT_SECRET` 是必填项；不使用 AI 时可以不配置 `DIFY_API_KEY`，但调用 AI 接口会返回服务未配置错误。

## 7.3 前端环境变量

```env
VITE_WS_PROTOCOL=ws
VITE_WS_HOST=127.0.0.1
VITE_WS_PORT=8082
VITE_API_MODE=real
RUN_COLLAB_TESTS=0
```

解析：`VITE_API_MODE=real` 请求真实后端，`mock` 启用前端 Mock adapter。协同专项测试默认 skip，需要执行时设置 `RUN_COLLAB_TESTS=1` 并提供可用 WS 地址，必要时补充 `VITE_WS_TOKEN`。

## 7.4 常用脚本

| 命令                                                | 作用                                                      |
| --------------------------------------------------- | --------------------------------------------------------- |
| `pnpm dev`                                          | 启动 workspace dev 任务                                   |
| `pnpm dev:server`                                   | 启动 NestJS 后端 watch 模式                               |
| `pnpm dev:desktop`                                  | 启动 Tauri 桌面端开发模式                                 |
| `pnpm build`                                        | 运行 Turbo build                                          |
| `pnpm docker:start`                                 | 启动本地 PostgreSQL                                       |
| `pnpm docker:stop`                                  | 停止本地 PostgreSQL                                       |
| `pnpm lint:apps`                                    | 检查 server 和 web lint                                   |
| `pnpm typecheck:apps`                               | 检查 server 和 web 类型                                   |
| `pnpm test:apps`                                    | 运行 server test + web unit test                          |
| `pnpm contract:apps`                                | 运行 web 契约 lint/typegen/test                           |
| `pnpm gate:apps`                                    | PR 主门禁：lint + typecheck + server test + web unit test |
| `pnpm gate:extended`                                | 扩展门禁：web collab + web e2e                            |
| `pnpm --filter @miaoma-doc/server migration:run`    | 执行后端数据库迁移                                        |
| `pnpm --filter @miaoma-doc/server migration:revert` | 回滚最近一次迁移                                          |
| `pnpm --filter @miaoma-doc/web test:e2e`            | 执行 Playwright 场景测试                                  |

解析：本地合并前建议固定执行 `pnpm gate:apps && pnpm contract:apps`；协同和 E2E 成本更高，适合扩展门禁或手动回归。

## 7.5 本地排障

-   后端启动报 `JWT_SECRET is required`：检查 `apps/backend/server/.env` 是否存在并配置 `JWT_SECRET`。
-   数据库连接失败或表不存在：确认 `pnpm docker:start` 已启动，`PG_PORT` 与 compose 映射一致，并执行 migration。
-   前端能登录但协同连不上：检查 `VITE_WS_PROTOCOL`、`VITE_WS_HOST`、`VITE_WS_PORT`、后端端口和本地 token。
-   AI 接口返回未配置：检查 `DIFY_API_KEY` 是否配置在后端环境变量中。
-   搜索结果不更新：等待定时任务处理索引队列，或检查后端日志中的 `[search-index]`。
-   `test:e2e` 报浏览器缺失：执行 `pnpm --filter @miaoma-doc/web exec playwright install chromium`。
-   协同测试被 skip：确认 `RUN_COLLAB_TESTS=1` 且 WS 地址已配置。

# 8. 中级/高级项目包装

## 8.1 中级版项目表达

-   技术栈要点：`TypeScript`、`React`、`Tiptap`、`ProseMirror`、`Yjs`、`NestJS`、`PostgreSQL`、`Tailwind CSS`、`Vitest`。
-   项目简介：设计并实现了一套支持富文本编辑、实时协同、文档权限、评论通知、搜索标签、模板快照、回收站和关系图谱的协同文档系统，采用 Monorepo 管理前端应用、后端服务和编辑器 SDK。
-   工作内容与成果：基于 `Tiptap + ProseMirror` 封装编辑器内核，支持块级扩展、mention 和 AI block。
-   工作内容与成果：基于 `Yjs + WebSocket + PostgreSQL` 完成多人实时协同编辑、状态回放和协同数据持久化。
-   工作内容与成果：基于 `React + React Query + React Router` 实现文档列表、详情、权限页、搜索页、通知页、回收站、图谱和契约演示页面。
-   工作内容与成果：基于 `NestJS + TypeORM` 实现用户认证、页面 CRUD、ACL、评论通知、搜索索引、模板快照和协同网关。

## 8.2 高级版项目表达

-   技术栈要点：`TypeScript`、`Tiptap`、`ProseMirror`、`Yjs`、`React`、`NestJS`、`PostgreSQL`、`Turborepo`、`Vitest`、`Playwright`、`OpenAPI contract`、`TypeORM migration`。
-   项目简介：主导设计了一套面向企业协作场景的协同文档系统，采用“编辑器内核层、React 适配层、UI 皮肤层、Web 业务层、后端治理层、协同持久化层、工程门禁层”分层设计，支持实时协同、文档权限、评论通知、搜索索引、模板快照、回收站和可扩展块系统。
-   工作内容与成果：抽象 `packages/core` 作为编辑器内核，统一管理 Schema、命令系统、扩展机制和导入导出能力。
-   工作内容与成果：基于 Yjs 构建实时协同链路，并结合 `y-postgresql` 完成协同数据持久化、状态回放与 WS 鉴权接入。
-   工作内容与成果：围绕 page 主实体扩展 ACL、标签、模板、快照、评论、通知和搜索索引，形成一套面向文档治理的后端模型。
-   工作内容与成果：通过 `ScheduleModule + migration + Vitest + Playwright + OpenAPI contract` 补齐索引处理、过期清理、数据库演进、契约校验和自动化测试能力。

## 8.3 一分钟总结版

如果面试官让我一分钟介绍这个项目，我会这样说：这个项目是一套面向企业内部知识协作的协同文档系统，不是单点编辑器 Demo。前端用 React 和 Vite 做业务页面，编辑器基于 Tiptap、ProseMirror 和 Yjs，后端用 NestJS、TypeORM 和 PostgreSQL 承载认证、页面、权限、评论、通知、搜索、模板、快照和协同网关。项目里我重点处理了三类问题：第一是协同编辑，通过 Yjs 和 y-postgresql 实现多人实时同步、状态恢复和 WS 鉴权；第二是文档治理，通过角色加操作位的 ACL 模型，把页面访问、成员邀请、评论管理、回收站和模板管理统一起来；第三是工程落地，通过 migration、定时任务、Vitest、Playwright 和 OpenAPI contract，让项目从学习型样例向可持续迭代工程靠近。

# 9. 高频面试问题

## 9.1 如何设计和实现一个支持实时协作的协同文档编辑器？

-   回答思路：系统需要拆成编辑器内核、协同同步层、业务服务层和数据存储层，本项目对应 `packages/core`、`Yjs/y-websocket`、`NestJS` 和 `PostgreSQL`。
-   回答思路：协同的关键不是谁先写谁后写，而是如何保证最终一致性，本项目基于 Yjs 的 CRDT 实现多人实时同步。
-   回答思路：协同通道不能匿名开放，本项目在 `/doc-yjs` 进入同步逻辑前增加了 WS Token 鉴权。
-   回答思路：真实企业场景中除了协同，还要考虑谁能查看、编辑、评论、分享和删除文档，本项目实现了文档级 ACL。
-   回答思路：为了防止服务重启或用户重连后数据丢失，本项目使用 `y-postgresql` 把协同更新写入 PostgreSQL。

## 9.2 如何通过插件化机制设计一个可扩展的协同文档编辑器？

-   回答思路：核心层负责文档模型、命令系统和基础扩展能力，业务层负责自定义块和交互，本项目中 core 定义底层，web 注入 mention 和 AI block。
-   回答思路：扩展接口需要允许新增 block spec、inline content spec、UI controller 和命令入口，而不是把所有业务写死在编辑器内核中。
-   回答思路：Mention 是自定义 inline content，AI 是自定义 block，二者都通过 Schema 扩展方式接入。

## 9.3 如何在协同文档编辑中实现实时同步与冲突解决？

-   回答思路：常见方案是 OT 或 CRDT，本项目采用 Yjs 的 CRDT，因为它更适合分布式实时协作场景。
-   回答思路：多人同时编辑时一定会有并发冲突，CRDT 的价值就在于通过数据结构保证各副本最终一致。
-   回答思路：真实协同场景还要考虑断线重连、延迟抖动、临时离线和重新同步，本项目通过 `WebsocketProvider` 和服务端同步逻辑覆盖基础同步链路。
-   回答思路：协同体验不只有文本同步，还包括用户在线状态和远程光标信息，本项目使用 awareness 维护协作者信息。

## 9.4 如何设计协同文档的文档引用关系图谱？

-   回答思路：关系图本质是“节点 + 边”，节点代表页面，边代表引用关系，本项目中节点来自 page 表，边来自文档 mention。
-   回答思路：引用关系不是单独手写关系表，而是从 Yjs 文档 XML 中反向解析出来。
-   回答思路：后端通过 `/page/graph` 聚合页面列表与引用关系，前端使用 `@xyflow/react` 绘制节点边，并通过 `d3-force` 做力导向布局。

## 9.5 如何实现私有化部署与数据安全？

-   回答思路：系统要能独立部署在企业自己的服务器环境中，当前项目通过 `JWT_SECRET`、`PG_*`、`SERVER_PORT`、`DIFY_*` 等环境变量完成关键配置。
-   回答思路：业务元数据、权限数据、评论通知和协同数据都进入企业自有 PostgreSQL，避免依赖外部 SaaS 存储。
-   回答思路：文档系统至少要有登录鉴权能力，本项目基于 Passport、JWT 和 Bearer Token 提供认证机制，并在 WS 通道补了鉴权。
-   回答思路：真实生产环境不应依赖 ORM 自动同步表结构，本项目已经改用 migration 管理表结构。

## 9.6 如何为协同文档设计成员权限与操作位模型？

-   回答思路：第一层是角色，负责定义大多数成员的默认能力，例如 `owner`、`editor`、`commenter`、`viewer`。
-   回答思路：第二层是操作位，用来补充角色之外的特殊授权，例如 `member_manage`、`comment_moderate`、`template_manage`。
-   回答思路：服务端不要把权限判断分散到每个接口里，最好统一抽象成 `assertAction()` 一类入口，本项目就是通过 `PageAccessService` 来做的。
-   回答思路：这样新增接口时只需要声明“这个动作需要什么权限”，不用每次手写一遍角色判断。

## 9.7 如何在 Yjs 持久化文档上构建搜索索引、快照与回收站？

-   回答思路：文档主内容存在 Yjs 里，不适合每次查询都直接遍历，所以要把搜索索引单独落到关系型表中。
-   回答思路：索引内容可以通过“读取 Yjs 文档 -> 提取纯文本 -> 合并标签文本 -> 写入索引表”的方式构建，本项目通过搜索任务和定时处理来完成。
-   回答思路：快照本质上可以保存当前 Yjs 状态编码，恢复时清空房间并回写那份状态。
-   回答思路：回收站不要立刻物理删除，而是先做软删除，再通过定时任务清理超过保留期的数据。

# 10. 文档解析与阅读路径

## 10.1 这份文档的结构来源

-   前半部分采用“需求背景 -> 学习成果 -> 学习产物 -> 技术选型”的项目说明结构，适合快速建立业务和技术全貌。
-   中间部分采用“系统架构 -> 模块关系 -> 数据流转”的技术复盘结构，适合从代码路径理解功能如何落地。
-   后半部分采用“核心亮点 -> 面试表达 -> 追问回答”的面试表达结构，适合把项目能力讲成可追问的工程设计。

## 10.2 如何从代码验证文档

-   路由闭环看 `apps/frontend/web/src/router/index.tsx`。
-   HTTP 鉴权和 Mock 切换看 `apps/frontend/web/src/utils/request.ts`。
-   协同接入看 `apps/frontend/web/src/pages/Doc/index.tsx` 与 `DocEditor.tsx`。
-   WS 鉴权看 `apps/backend/server/src/modules/doc-yjs/doc-yjs.gateway.ts` 与 `ws-auth.ts`。
-   后端模块装配看 `apps/backend/server/src/app.module.ts`。
-   ACL 模型看 `apps/backend/server/src/modules/page/page-acl.constants.ts` 与 `page-access.service.ts`。
-   搜索和清理任务看 `apps/backend/server/src/fundamentals/tasks/tasks.service.ts`。
-   OpenAPI 契约看 `docs/openapi/miaoma-docs-mock-openapi.yaml`。

## 10.3 阅读建议

-   如果用于面试，优先读第 5、6、8、9 章，重点讲协同编辑、ACL、搜索索引、快照回收站和工程门禁。
-   如果用于开发接手，优先读第 4、5、7 章，先跑起来，再按模块路径进入代码。
-   如果用于简历包装，优先读第 6 和第 8 章，把“用了什么库”转成“解决了什么边界问题”。

# 11. 许可证与说明

-   当前仓库是内部学习与项目实践用途，不作为开源商业发行声明。
-   README 以代码仓库当前能力为准，后续功能变更时需要同步更新本文档。
-   当前 NestJS 后端真实控制器集中在认证、用户、页面、评论、通知、标签、模板、搜索和 AI；审计、治理、可观测、SSO 当前主要由前端页面、Mock 服务和 OpenAPI 契约承载。
