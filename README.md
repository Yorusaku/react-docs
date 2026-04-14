# 妙码协同文档项目文档

> 说明：本版本按“适合复制到飞书文档”的方式整理，去掉了空行，保留了有序结构和无序结构，重点帮助你从需求、架构、模块关系、实现细节和面试表达几个维度系统理解项目，并同步对齐当前代码里已经落地的能力。

## 1. 需求背景介绍

### 1.1 需求背景

-   在企业级场景中，文档系统不只是一个富文本编辑器，还需要承担知识沉淀、多人协作、跨文档引用、权限控制、搜索发现、评论沟通和数据持久化等职责。
-   市面上的飞书文档、Notion 等产品已经验证了协同文档的价值，但很多企业仍然希望掌握可私有化部署、可定制扩展、可深度集成的编辑器能力。
-   因此，这个项目的目标不是只做一个“编辑器 Demo”，而是搭建一套具备企业级协同文档雏形的完整方案，并继续向“文档治理 + 协作效率 + 工程化落地”三个方向演进。

### 1.2 项目概述

-   项目名称：`miaoma-docs`
-   项目定位：一个基于 Monorepo 组织的协同文档系统，包含编辑器内核、React 适配层、UI 套件、Web 前端、NestJS 后端和桌面端壳，当前已经从基础协同编辑 Demo 演进到带权限、评论、通知、搜索、模板、快照、回收站和 AI 服务端代理的文档系统雏形。
-   核心能力：富文本编辑、实时协同编辑、文档列表管理、文档引用关系图谱、自定义块扩展、成员权限管理、评论与 @ 提醒、搜索与标签、模板复用、快照恢复、回收站和协同数据持久化。
-   技术主线：前端以 `React + Vite` 为主，编辑器基于 `Tiptap + ProseMirror`，协同层基于 `Yjs`，服务端基于 `NestJS + PostgreSQL`，并补充 `ScheduleModule + TypeORM migration + Vitest` 作为工程化支撑。

### 1.3 核心业务需求

1. 提供完整的富文本编辑能力。

-   支持段落、标题、列表、代码块、表格、文件类内容等基础块级能力。
-   支持工具栏、侧边菜单、建议菜单、自定义块和 AI block 等常见编辑器交互与扩展点。

2. 支持多人实时协同编辑。

-   多个用户同时编辑同一文档时，需要保证内容最终一致。
-   需要支持在线状态、远程用户信息、协作感知和服务重启后的状态回放能力。

3. 支持文档之间的结构化引用与知识图谱。

-   用户可以在文档中通过 `mention` 引用其他页面。
-   系统可以根据引用关系生成文档关系图谱，帮助知识可视化导航。

4. 支持文档级权限控制与成员协作。

-   文档需要支持 `owner / editor / commenter / viewer` 四类基础角色。
-   需要支持分享、成员管理、删除、恢复、评论管理、模板管理等操作位控制。

5. 支持评论沟通与通知提醒。

-   用户可以围绕文档内容发起评论、回复评论、标记解决和删除评论。
-   当评论里提及其他用户时，系统需要生成通知并提供通知中心入口。

6. 支持搜索、标签与模板复用。

-   用户需要按标题、正文、标签搜索自己可访问的文档。
-   系统需要支持标签管理、模板管理，以及“从页面生成模板”“从模板创建页面”两条复用链路。

7. 支持快照、回收站与数据生命周期管理。

-   页面删除不能直接物理删除，而是先进入回收站，支持恢复和永久删除。
-   协同文档需要支持手动快照、恢复前自动备份和过期数据清理。

8. 支持企业内部部署与安全接入。

-   页面元数据、权限数据、评论通知、模板快照和协同编辑数据都需要保存到企业可控的数据存储中。
-   AI 能力需要通过服务端代理接入，避免把密钥暴露到前端。

### 1.4 技术需求

-   编辑器内核要有清晰的 Schema 设计、命令系统和扩展机制。
-   协同层要支持低延迟同步、冲突自动合并、断线重连、WebSocket 鉴权和持久化存储。
-   服务端要同时支持 REST API、WebSocket 协同通道、定时任务和基于 migration 的数据库演进。
-   前端要支持页面路由、接口请求、状态缓存、权限页面、评论通知、搜索发现和关系图谱可视化。
-   工程层要支持 Workspace、统一构建、跨包复用、本地开发联调、基础自动化测试和环境变量配置。

## 2. 学习成果

1. 需求分析与架构设计能力。

-   能够理解企业级协同文档系统从“编辑器”向“文档治理平台”演进时新增的业务需求和技术需求。
-   能够从“编辑器内核、协同模块、服务端、前端应用、工程化支撑”五层拆解系统架构。

2. 富文本编辑器实现能力。

-   理解 `ProseMirror` 的文档模型与编辑器状态管理方式。
-   理解 `Tiptap` 在 `ProseMirror` 之上的扩展封装方式。
-   能够看懂并分析 `MiaomaDocEditor`、`MiaomaDocSchema`、默认块定义、命令系统与自定义扩展接入方式。

3. 实时协同与鉴权实现能力。

-   理解 `Yjs` 的 CRDT 思路以及为什么它适合做多人协同。
-   理解客户端 `Y.Doc`、`WebSocket Provider`、服务端同步网关、`y-postgresql` 持久化和 WS Token 鉴权之间的关系。

4. 权限模型与文档治理能力。

-   能够理解文档成员、角色、操作位、权限判断和接口保护是如何组织起来的。
-   能够分析 ACL、评论、通知、回收站、快照、模板等治理能力如何围绕文档主实体展开。

5. 搜索、标签与数据加工能力。

-   能够理解搜索索引不是手写一份独立内容，而是从 Yjs 文档和标签数据中反向提取、加工并落库。
-   能够理解定时任务、索引入队、全文检索和回收站清理之间的协作关系。

6. 全栈开发与工程化能力。

-   能够串联 `React + React Router + React Query + NestJS + TypeORM + PostgreSQL` 的整条业务链路。
-   能够理解 `Vitest`、`TypeORM migration`、环境变量、定时任务和 Monorepo 分层在真实项目中的意义。

7. 可视化与扩展能力。

-   能够理解文档引用关系图谱是如何从 mention 数据中提取出来的。
-   能够理解自定义 `mention`、`AI block`、评论区、分享入口和搜索页等功能是如何接入到现有体系中的。

## 3. 学习产物

1. 企业级协同文档编辑器。

-   基于 `Tiptap + ProseMirror + Yjs` 实现的协同文档编辑器。
-   支持文档列表、文档详情、实时协同、引用链接、关系图谱、评论区和分享入口。

2. 编辑器基础 SDK。

-   `@miaoma-doc/core` 提供编辑器 Schema、命令系统、块定义和导入导出能力。
-   `@miaoma-doc/react` 提供 React 接入能力和 UI 控制器。

3. UI 套件与共享组件。

-   `@miaoma-doc/shadcn` 提供编辑器 UI 皮肤。
-   `@miaoma-doc/shadcn-shared-ui` 提供项目级共享 UI 组件。

4. 文档治理能力集合。

-   支持文档 ACL、成员邀请、操作位管理、评论与 @ 提醒、通知中心、回收站、标签、模板和快照。
-   支持从模板创建文档、从页面生成模板，以及快照恢复前自动备份。

5. 后端服务模块。

-   `@miaoma-doc/server` 提供用户认证、页面管理、图谱接口、搜索接口、标签接口、模板接口、评论接口、通知接口、AI 代理和文档协同 WebSocket 网关。
-   协同数据通过 `y-postgresql` 保存到 PostgreSQL，业务表同时承载页面、成员、评论、通知、模板、标签、快照与搜索索引。

6. 工程化与测试基础。

-   后端支持 `migration:run`、`migration:revert`、`migration:generate`、`typecheck`、`test` 等脚本。
-   前后端补充了密码哈希、ACL、WS 鉴权、标题清洗、分享链接、图谱数据等基础测试用例。

7. 项目级学习文档。

-   可从需求背景、模块职责、技术选型、系统架构、部署要求和面试问答多个角度完整复盘项目。

## 4. 技术选型

### 4.1 `@miaoma-doc/core`

-   简介：`@miaoma-doc/core` 是项目的编辑器内核层，负责提供文档模型、默认块定义、编辑命令、扩展机制以及 HTML/Markdown 转换能力。
-   核心职责：定义编辑器 Schema，封装 `MiaomaDocEditor`，管理 block/inline/style 三类能力，承载插件机制与底层编辑逻辑。
-   关键依赖：`prosemirror-model`、`prosemirror-state`、`prosemirror-view`、`prosemirror-transform`、`prosemirror-tables`。
-   关键依赖：`@tiptap/core`、`@tiptap/extension-bold`、`@tiptap/extension-code`、`@tiptap/extension-collaboration`、`@tiptap/extension-collaboration-cursor`。
-   关键依赖：`yjs`、`y-prosemirror`、`y-protocols`，用于协同编辑与状态同步。
-   关键依赖：`rehype-*`、`remark-*`，用于 HTML 和 Markdown 的解析与转换。
-   关键依赖：`shiki`，用于代码高亮支持。
-   学习重点：`packages/core/src/editor/MiaomaDocEditor.ts`、`packages/core/src/editor/MiaomaDocSchema.ts`、`packages/core/src/blocks/defaultBlocks.ts`、`packages/core/src/extensions/*`。

### 4.2 `@miaoma-doc/react`

-   简介：`@miaoma-doc/react` 是编辑器的 React 适配层，负责把底层编辑器实例包装成 React 可以直接使用的组件、Hook 和控制器。
-   核心职责：提供 `useCreateMiaomaDoc`、`MiaomaDocViewRaw`、SuggestionMenu、FormattingToolbar、LinkToolbar、SideMenu 等 React 侧能力。
-   关键依赖：`react`、`react-dom`，提供组件和渲染能力。
-   关键依赖：`@floating-ui/react`，用于浮动面板定位。
-   关键依赖：`lodash.merge`、`react-icons`，用于配置合并与图标展示。
-   核心关系：它依赖 `@miaoma-doc/core`，但不关心具体 UI 风格，只负责 React 运行时接入。
-   学习重点：`packages/react/src/hooks/useCreateMiaomaDoc.tsx`、`packages/react/src/editor/MiaomaDocView.tsx`、`packages/react/src/components/*`。

### 4.3 `@miaoma-doc/shadcn`

-   简介：`@miaoma-doc/shadcn` 是项目的编辑器 UI 皮肤层，基于 Tailwind 和 shadcn 风格组件实现编辑器默认交互界面。
-   核心职责：把 `@miaoma-doc/react` 暴露的 UI 插槽用一套统一风格的组件实现出来，并输出项目中实际使用的 `MiaomaDocView`。
-   关键依赖：`@miaoma-doc/core`、`@miaoma-doc/react`。
-   关键依赖：`@radix-ui/react-*` 系列组件，用于下拉、弹窗、提示等复杂交互。
-   关键依赖：`tailwindcss`、`tailwind-merge`、`class-variance-authority`、`clsx`，用于样式系统管理。
-   关键依赖：`react-hook-form`、`lucide-react`，用于表单与图标。
-   学习重点：`packages/shadcn/src/index.tsx`、`packages/shadcn/src/toolbar/*`、`packages/shadcn/src/suggestionMenu/*`、`packages/shadcn/src/sideMenu/*`。

### 4.4 `@miaoma-doc/shadcn-shared-ui`

-   简介：`@miaoma-doc/shadcn-shared-ui` 是项目共享 UI 组件库，主要为业务前端和编辑器 UI 层提供统一的基础组件。
-   核心职责：提供 Button、Form、Input、Sidebar、Popover、Toast、Avatar 等业务级常用组件。
-   关键依赖：`@radix-ui/react-*` 系列基础交互组件。
-   关键依赖：`tailwindcss`、`tailwindcss-animate`、`clsx`、`lucide-react`。
-   核心价值：让 `packages/shadcn` 和 `apps/frontend/web` 共享一套基础 UI 设施，避免重复封装。

### 4.5 `@miaoma-doc/web`

-   简介：`@miaoma-doc/web` 是项目主前端应用，负责页面展示、接口请求、编辑器接入和文档治理能力的界面承载。
-   核心职责：实现登录页、文档列表页、文档编辑页、文档 ACL 页、搜索页、通知页、回收站页、文档图谱页和全局布局。
-   关键依赖：`react-router-dom`，用于前端路由管理，当前路由已覆盖 `/doc`、`/doc/:id`、`/doc/:id/acl`、`/doc/graph`、`/search`、`/notifications`、`/trash`、`/account/login`。
-   关键依赖：`@tanstack/react-query`，用于服务端状态获取、缓存和失效管理。
-   关键依赖：`axios`，用于 HTTP 请求封装，统一在请求头写入 `Authorization: Bearer xxx`。
-   关键依赖：`y-websocket`、`yjs`，用于客户端协同连接与远程用户 awareness。
-   关键依赖：`@xyflow/react`、`d3-force`，用于文档图谱可视化。
-   关键能力：页面侧除协同编辑外，还补充了评论区、分享链接、模板入口、通知中心和回收站操作。
-   运行要点：前端可通过 `VITE_WS_PROTOCOL`、`VITE_WS_HOST`、`VITE_WS_PORT` 配置协同通道地址。
-   学习重点：`apps/frontend/web/src/router/index.tsx`、`apps/frontend/web/src/pages/Doc/index.tsx`、`apps/frontend/web/src/pages/DocAcl/index.tsx`、`apps/frontend/web/src/pages/Search/index.tsx`、`apps/frontend/web/src/pages/Notifications/index.tsx`、`apps/frontend/web/src/pages/Trash/index.tsx`、`apps/frontend/web/src/services/*`。

### 4.6 `@miaoma-doc/server`

-   简介：`@miaoma-doc/server` 是项目主后端服务，基于 NestJS 构建，负责 API 服务、认证、页面管理、权限治理、协同同步、AI 代理和数据持久化。
-   核心职责：提供认证接口、用户接口、页面 CRUD、图谱接口、ACL 接口、标签接口、模板接口、搜索接口、评论接口、通知接口和文档协同 WebSocket 网关。
-   模块组成：当前已装配 `AuthModule`、`UserModule`、`ApplicationModule`、`DocYjsModule`、`PageModule`、`TagModule`、`TemplateModule`、`SearchModule`、`NotificationModule`、`CommentModule`、`AiModule`、`TasksModule`、`YjsPostgresqlModule`。
-   关键依赖：`@nestjs/common`、`@nestjs/core`、`@nestjs/jwt`、`@nestjs/passport`、`@nestjs/websockets`、`@nestjs/schedule`。
-   关键依赖：`typeorm`、`pg`，用于 PostgreSQL 数据持久化；当前已关闭 `synchronize` 并改用 migration 管理表结构。
-   关键依赖：`passport-local`、`passport-jwt`、`bcryptjs`，用于本地登录、JWT 鉴权与密码哈希校验。
-   关键依赖：`yjs`、`y-protocols`、`y-postgresql`，用于协同数据同步、状态恢复和落库。
-   关键依赖：`zod`、`nanoid`、`xml-js`，分别用于参数校验、ID 生成和 XML 处理。
-   关键能力：`DocYjsGateway` 当前增加了基于 query token / `Authorization` 的 WS 鉴权；`AiService` 通过服务端代理对接 Dify，并做了限流与审计日志。
-   运行要点：后端部署至少需要配置 `JWT_SECRET`、`PG_HOST`、`PG_PORT`、`PG_USER`、`PG_PASSWORD`、`PG_DATABASE`、`SERVER_PORT`、`DIFY_API_KEY`、`DIFY_API_BASE_URL`。
-   工程脚本：当前支持 `migration:run`、`migration:revert`、`migration:generate`、`lint`、`typecheck`、`test`。
-   学习重点：`apps/backend/server/src/main.ts`、`apps/backend/server/src/app.module.ts`、`apps/backend/server/src/modules/*`、`apps/backend/server/src/fundamentals/yjs-postgresql/*`、`apps/backend/server/src/config/typeorm-datasource.ts`。

### 4.7 `@miaoma-doc/desktop`

-   简介：`@miaoma-doc/desktop` 是桌面端壳，基于 Tauri 2 搭建，当前主要承担桌面打包入口的角色。
-   核心职责：把 Web 端能力包装成桌面应用，便于后续多端分发。
-   关键依赖：`@tauri-apps/api`、`@tauri-apps/plugin-shell`、`@tauri-apps/cli`。
-   当前状态：桌面端业务逻辑较轻，核心功能仍集中在 `web` 和 `server`。

### 4.8 `@miaoma-doc/y-websocket-server-demo`

-   简介：这是一个独立的 y-websocket 演示服务，主要用来帮助理解官方协同服务的基础运行方式。
-   核心职责：运行最小化 WebSocket 协同示例，便于和主项目里的 NestJS 协同网关做对照学习。
-   关键依赖：`ws`、`y-websocket`。

### 4.9 技术栈总结

-   前端技术栈：`React`、`React Router`、`React Query`、`Axios`、`Vite`。
-   编辑器技术栈：`Tiptap`、`ProseMirror`、`Yjs`、`y-websocket`。
-   UI 技术栈：`Tailwind CSS`、`Radix UI`、`shadcn` 风格封装。
-   后端技术栈：`NestJS`、`TypeORM`、`PostgreSQL`、`Passport`、`JWT`、`bcryptjs`、`Zod`、`ScheduleModule`。
-   文档治理技术栈：`Page ACL`、`Comment`、`Notification`、`Tag`、`Template`、`Snapshot`、`Trash`、`PostgreSQL Full Text Search`。
-   图谱技术栈：`@xyflow/react`、`d3-force`。
-   工程化技术栈：`pnpm workspace`、`Turborepo`、`ESLint`、`Prettier`、`Vitest`、`TypeORM migration`、`Docker Compose`。
-   部署配置要点：后端关注 `JWT_SECRET`、`PG_*`、`SERVER_PORT`、`DIFY_*`，前端关注 `VITE_WS_*`。

## 5. 系统架构设计与模块关系

### 5.1 整体架构

```text
浏览器 Web 应用
├─ HTTP /api/** -> NestJS Server -> PostgreSQL(用户/页面/成员/评论/通知/标签/模板/快照/搜索索引等业务表)
├─ WS /doc-yjs -> DocYjsGateway(JWT 鉴权) -> y-postgresql(PostgreSQL 协同更新表)
└─ React Query + Router + Sidebar -> Doc / ACL / Search / Notifications / Trash / Graph 等页面

ScheduleModule -> TasksService -> 搜索索引任务 + 过期快照/回收站数据清理

packages/core -> packages/react -> packages/shadcn -> apps/frontend/web
packages/shadcn-shared-ui -> packages/shadcn + apps/frontend/web
apps/frontend/desktop -> 复用 web 产物进行桌面封装
```

### 5.2 Monorepo 分层关系

1. `apps` 层负责“最终运行形态”。

-   `apps/frontend/web` 是主 Web 客户端，承载文档编辑、权限、搜索、通知、回收站和图谱页面。
-   `apps/backend/server` 是主业务服务端，承载 API、协同、AI 代理、定时任务和 migration。
-   `apps/frontend/desktop` 是桌面壳。
-   `apps/backend/y-websocket-server-demo` 是协同演示服务。

2. `packages` 层负责“可复用能力沉淀”。

-   `packages/core` 负责编辑器内核。
-   `packages/react` 负责 React 适配。
-   `packages/shadcn` 负责编辑器 UI 皮肤。
-   `packages/shadcn-shared-ui` 负责共享业务组件。

3. 依赖方向是单向的。

-   `web` 依赖 `core/react/shadcn/shared-ui`。
-   `react` 依赖 `core`。
-   `shadcn` 依赖 `core + react`。
-   `server` 独立提供业务与协同能力，不直接依赖这些前端包。

### 5.3 前端模块关系

1. 路由层。

-   `src/router/index.tsx` 负责组织 `/doc`、`/doc/:id`、`/doc/:id/acl`、`/doc/graph`、`/search`、`/notifications`、`/trash`、`/account/login`。
-   `src/router/AuthRoute.tsx` 负责登录态拦截。

2. 布局层。

-   `src/layout/index.tsx` 注入 Sidebar 布局和页面 Outlet。
-   `src/components/LayoutAside/Aside.tsx`、`AsideHeader.tsx`、`AsideFooter.tsx` 负责文档入口、搜索入口、通知入口、回收站入口和用户操作区。

3. 页面层。

-   `DocList` 负责文档列表、新建文档和模板入口。
-   `Doc` 负责文档详情、标题编辑、协同连接、评论区、分享入口和权限入口。
-   `DocAclPage` 负责成员邀请、角色切换和操作位配置。
-   `SearchPage` 负责标题/正文搜索与结果跳转。
-   `NotificationsPage` 负责通知列表、单条已读和全部已读。
-   `TrashPage` 负责软删除页面的恢复与永久删除。
-   `DocGraph` 负责文档关系图谱可视化。
-   `Account/Login` 负责登录注册。

4. 服务与状态层。

-   `src/services/page.ts` 负责页面、回收站、ACL、标签、快照相关接口。
-   `src/services/comment.ts`、`notification.ts`、`search.ts`、`tag.ts`、`template.ts`、`ai.ts` 负责新增治理类接口。
-   `request.ts` 统一注入 `Authorization: Bearer` 请求头，并在 `401` 时跳转登录页。

5. 编辑器接入层。

-   `DocEditor.tsx` 把 `Y.Doc`、`WebsocketProvider`、Schema、自定义块和 SuggestionMenu 连接起来。
-   `Mention` 和 `AI` 是具体业务扩展点。
-   `Doc/index.tsx` 负责把本地 token 透传到 `/doc-yjs` 连接参数中，并维护远程用户 awareness。

### 5.4 后端模块关系

1. 启动与装配层。

-   `main.ts` 负责应用创建、全局异常处理、Swagger 和服务器启动。
-   `app.module.ts` 负责装配 `AuthModule`、`UserModule`、`ApplicationModule`、`DocYjsModule`、`PageModule`、`TagModule`、`TemplateModule`、`SearchModule`、`NotificationModule`、`CommentModule`、`AiModule`、`TasksModule`、`YjsPostgresqlModule`。

2. 认证层。

-   `auth` 模块负责用户名密码登录、JWT 签发和 Bearer Token 校验。
-   `user` 模块负责注册、用户查询和密码哈希校验。

3. 文档治理与业务层。

-   `page` 模块负责页面创建、更新、查询、图谱、回收站、ACL、标签、快照、搜索索引入队等核心能力。
-   `page-access.service.ts` 负责成员、角色、操作位和 `assertAction` 统一鉴权。
-   `comment` 模块负责评论线程、解决状态、删除逻辑和 @ 提醒。
-   `notification` 模块负责通知中心读取与已读状态更新。
-   `tag`、`template`、`search` 模块分别负责标签管理、模板复用和全文搜索入口。
-   `ai` 模块负责 AI 代理调用、限流和审计日志。

4. 协同层。

-   `doc-yjs.gateway.ts` 负责 WebSocket 连接接入，并在进入 `setupWSConnection` 之前完成 WS 鉴权。
-   `ws-auth.ts` 负责从 query token 或 `Authorization` 请求头解析并验证 token。
-   `yjs-postgresql.module.ts` 负责把 Yjs 更新绑定到 PostgreSQL，并支持文档状态恢复、清空和重建。

5. 支撑层。

-   `tasks.service.ts` 通过 `@Cron` 定时处理搜索索引任务和过期数据清理。
-   `migrations/*` 负责数据库结构演进。
-   `test/*` 负责密码、ACL、WS 鉴权等基础测试。

### 5.5 核心数据流

1. 登录与鉴权链路。

-   前端登录页提交用户名和密码。
-   注册时后端通过 `bcryptjs` 进行密码哈希；登录时由 `LocalStrategy -> AuthService -> UserService -> verifyPassword` 校验口令。
-   登录成功后返回 JWT，前端保存到 `localStorage`。
-   后续 HTTP 请求由 `request.ts` 自动把 token 写入 `Authorization: Bearer xxx` 请求头。
-   WebSocket `/doc-yjs` 同样通过 query token 或 `Authorization` 请求头完成鉴权。

2. 文档列表、详情与标题编辑链路。

-   前端通过 `fetchPageList`、`fetchPageDetail` 请求页面数据。
-   页面标题在 `Doc/index.tsx` 中本地输入、debounce 更新，再经 `updatePage` 写回服务端。
-   React Query 负责缓存、失效和页面刷新。

3. 协同编辑链路。

-   文档页初始化时创建 `Y.Doc` 和 `WebsocketProvider`。
-   编辑器把当前文档绑定到 `doc.getXmlFragment('document-store-${pageId}')`。
-   用户输入后产生 Yjs update。
-   服务端通过 `setupWSConnection` 广播 update 并写入 PostgreSQL。
-   新用户加入或服务重启后，通过历史 update 回放恢复文档状态。

4. 文档权限与成员管理链路。

-   页面创建成功后，`PageAccessService.createOwnerMember()` 自动为创建者建立 `owner` 成员关系。
-   文档 ACL 页通过 `/page/:pageId/acl`、`/page/:pageId/members/invite`、`/page/:pageId/members/:userId` 管理成员。
-   服务端通过 `assertAction()` 统一判断当前用户是否拥有 `read / write / comment / member_manage / invite_user` 等能力。

5. 评论、@ 提醒与通知链路。

-   前端评论区通过 `/page/:pageId/comments` 创建评论，并可附带 `mentionUserIds`。
-   服务端 `CommentService` 保存评论后，调用 `NotificationService.createMentionNotifications()` 为被提及用户创建通知。
-   通知中心通过 `/notifications` 获取未读数和通知列表，并支持单条已读和全部已读。

6. 搜索、标签与发现链路。

-   页面标题更新、标签更新、删除恢复等动作会通过 `enqueueSearchIndex()` 把搜索任务写入队列表。
-   定时任务 `processPendingSearchJobs()` 从 Yjs 文档 XML 和标签关系中提取正文与标签文本，落入 `page_search_index`。
-   `/search/pages` 基于 PostgreSQL 全文检索查询用户可访问页面，前端 `SearchPage` 负责展示结果。

7. 模板与快照链路。

-   “从页面生成模板”会读取当前 Yjs 文档更新，转成 base64 存入 `template.documentUpdate`。
-   “从模板创建页面”会先创建页面，再把模板里的协同文档更新写回新页面的 Yjs room。
-   手动创建快照时会把当前文档状态编码保存；恢复快照前会先自动生成一份 `before_restore` 备份快照。

8. 回收站与数据生命周期链路。

-   删除页面时先走软删除，页面进入 `/page/trash`。
-   用户可以在回收站恢复页面，或者执行永久删除，同时清理对应搜索索引和 Yjs 文档。
-   定时任务 `cleanupExpiredData()` 会清理过期快照和超过保留期的软删除页面。

9. 图谱链路。

-   前端插入 `mention`，其引用信息进入 Yjs XML 文档。
-   后端读取 Yjs 文档对应 XML，使用 `yjsXmlMentionCollect` 提取 mention id。
-   `/page/graph` 返回页面和引用关系。
-   前端利用 `d3-force` 计算布局，再由 `@xyflow/react` 渲染节点与边。

## 6. 核心实现与项目亮点

### 6.1 协同编辑与 WS 鉴权

-   客户端协同核心在 `apps/frontend/web/src/pages/Doc/index.tsx` 和 `apps/frontend/web/src/pages/Doc/DocEditor.tsx`。
-   服务端协同核心在 `apps/backend/server/src/modules/doc-yjs/doc-yjs.gateway.ts` 和 `apps/backend/server/src/fundamentals/yjs-postgresql/utils.ts`。
-   本项目没有采用传统 OT，而是直接基于 `Yjs` 的 CRDT 思路做同步与冲突合并。
-   与旧版本相比，本轮新增了 `resolveWsToken + verifyWsToken` 这一层 WS 鉴权，协同连接不再是匿名接入。
-   协同数据与业务元数据分开存储，业务表保存页面基础信息，Yjs 表保存协同增量更新。

### 6.2 权限模型与成员协作

-   文档权限模型抽象为“角色 + 操作位”两层：角色负责基础能力，操作位负责补充细粒度授权。
-   当前角色为 `owner / editor / commenter / viewer`，操作位包含 `share`、`member_manage`、`delete`、`restore`、`export`、`comment_moderate`、`template_manage`、`invite_user`。
-   `PageAccessService.assertAction()` 把页面读取、成员查询、权限判断和异常抛出收敛到一个入口，避免权限逻辑散落在各个 controller / service 中。
-   前端 `DocAclPage` 直接对应这套模型，支持邀请成员、切换角色、勾选操作位和移除成员。

### 6.3 评论、@ 提醒与通知中心

-   评论实体不只是“一段文本”，还包含 `anchor`、`parentComment`、`resolved`、`hidden`、`mentionUserIds` 等字段，已经具备线程化和锚点评论的基础形态。
-   评论创建后会自动触发 @ 提醒通知，通知中心可以查看未读数、单条已读和全部已读。
-   评论权限和评论管理权限分离：普通成员可以评论，具备 `comment_moderate` 能力的成员可以执行更强的评论治理动作。
-   这一套设计把“协作编辑”扩展成了“协作沟通”，文档不再只是编辑器本身。

### 6.4 搜索索引、标签与发现

-   搜索不是直接扫描实时文档，而是通过搜索任务把标题、正文纯文本、标签文本加工到索引表中，再用 PostgreSQL 全文检索查询。
-   这样做的好处是把“协同编辑主链路”和“搜索查询链路”解耦，避免每次搜索都直接读取完整 Yjs 文档。
-   标签能力不仅服务于页面归类，也会参与搜索检索条件与索引构建。
-   前端 `SearchPage`、`DocList` 模板入口和图谱页一起，构成了当前项目里“编辑之外的发现能力”。

### 6.5 模板、快照与回收站

-   模板能力基于“保存 Yjs 文档更新”实现，而不是只复制页面元数据，因此可以把页面结构和正文一起复用。
-   快照能力同样复用了 Yjs 状态编码能力，并在恢复前自动创建一份备份快照，降低误操作风险。
-   页面删除采用软删除优先，用户可在回收站执行恢复或永久删除。
-   配合 `cleanupExpiredData()` 定时任务，项目已经具备基础的数据生命周期管理能力，而不是单纯 CRUD。

### 6.6 Monorepo 分层与工程化能力

-   `core/react/shadcn/web` 的层次划分比较清晰，便于从“底层能力 -> 适配层 -> UI 层 -> 应用层”逐步理解项目。
-   后端本轮新增了 migration、定时任务、环境变量强约束和 Vitest 测试，说明项目开始从“学习型样例”往“可持续演进的工程”靠拢。
-   前端也补充了分享链接、标题清洗、图谱数据归一化等基础测试，降低了后续迭代的回归风险。

### 6.7 本轮已完成的改进与后续演进点

1. 本轮已完成的改进。

-   `JWT_SECRET` 已改为环境变量，不再使用硬编码 secret。
-   `Authorization: Bearer` 已替代自定义 `token` 请求头，HTTP 鉴权链路更加标准。
-   `/doc-yjs` 已补充 WS 鉴权，支持 query token 和 `Authorization` 头解析。
-   AI 已迁移到服务端代理，通过 `DIFY_API_KEY` / `DIFY_API_BASE_URL` 管理上游调用，并增加限流和审计日志。
-   `TypeORM synchronize: false` + migration 已启用，数据库结构开始走更标准的演进路线。
-   前端密码加密逻辑已移除，改为后端统一做哈希存储和校验。
-   基础测试已补上，覆盖密码、ACL、WS 鉴权、标题清洗、分享链接和图谱归一化等关键点。

2. 仍可继续演进的方向。

-   当前 token 仍保存在 `localStorage`，后续可继续演进为 refresh token 或 HttpOnly Cookie 方案。
-   当前分享链接更多是“已登录用户访问入口”，后续可以继续扩展公开分享、链接有效期和只读/可评论分享策略。
-   当前评论锚点、通知推送和搜索高亮仍以基础能力为主，后续可继续增强实时提醒、富锚点定位和高亮召回体验。
-   当前模板、快照、回收站已经具备雏形，后续可以继续补充版本对比、模板分类和保留策略配置。

## 7. 中级/高级项目包装

### 7.1 中级版项目表达

-   技术栈要点：`TypeScript`、`React`、`Tiptap`、`ProseMirror`、`Yjs`、`NestJS`、`PostgreSQL`、`Tailwind CSS`、`Vitest`。
-   项目简介：设计并实现了一套支持富文本编辑、实时协同、文档权限、评论通知、搜索标签、模板快照和关系图谱的协同文档系统，采用 Monorepo 管理前端应用、后端服务和编辑器 SDK。
-   工作内容与成果：基于 `Tiptap + ProseMirror` 封装编辑器内核，支持块级扩展、mention 和 AI block。
-   工作内容与成果：基于 `Yjs + WebSocket + PostgreSQL` 完成多人实时协同编辑、状态回放和协同数据持久化。
-   工作内容与成果：基于 `React + React Query + React Router` 实现文档列表、详情、权限页、搜索页、通知页、回收站和图谱页面。
-   工作内容与成果：基于 `NestJS + TypeORM` 实现用户认证、页面 CRUD、ACL、评论通知、搜索索引、模板快照和协同网关。

### 7.2 高级版项目表达

-   技术栈要点：`TypeScript`、`Tiptap`、`ProseMirror`、`Yjs`、`React`、`NestJS`、`PostgreSQL`、`Turborepo`、`Tailwind CSS`、`Vitest`、`TypeORM migration`。
-   项目简介：主导设计了一套面向企业协作场景的协同文档系统，采用“编辑器内核层、React 适配层、UI 皮肤层、业务应用层、治理与工程化支撑层”分层设计，支持实时协同、文档权限、评论通知、搜索索引、模板快照、回收站和可扩展块系统。
-   工作内容与成果：抽象 `packages/core` 作为编辑器内核，统一管理 Schema、命令系统、扩展机制和导入导出能力。
-   工作内容与成果：基于 `Yjs` 构建实时协同链路，并结合 `y-postgresql` 完成协同数据持久化、状态回放与 WS 鉴权接入。
-   工作内容与成果：围绕 `page` 主实体扩展 ACL、标签、模板、快照、评论、通知和搜索索引，形成一套面向文档治理的后端模型。
-   工作内容与成果：通过 `ScheduleModule + migration + Vitest` 补齐索引处理、过期清理、数据库演进和基础自动化测试能力。

## 8. 面试问题

### 8.1 如何设计和实现一个支持实时协作的协同文档编辑器？设计过程中需要考虑哪些关键技术点？

-   回答思路：
-   架构设计：通常需要把系统拆成编辑器内核、协同同步层、业务服务层和数据存储层，本项目对应 `core`、`Yjs`、`NestJS` 和 `PostgreSQL`。
-   数据同步：协同的关键不是“谁先写谁后写”，而是如何保证最终一致性，本项目基于 `Yjs` 的 CRDT 实现多人实时同步。
-   接入安全：协同通道不能默认匿名开放，本项目在 `/doc-yjs` 进入同步逻辑前增加了 WS Token 鉴权。
-   权限管理：真实企业场景中除了协同，还要考虑谁能查看、编辑、评论、分享和删除文档，本项目已经实现了文档级 ACL。
-   持久化：为了防止服务重启或用户重连后数据丢失，本项目使用 `y-postgresql` 把协同更新写入 PostgreSQL。
-   结合项目可举例说明：前端在 `DocEditor` 中把 `Y.Doc` 绑定到 `document-store-${pageId}`，服务端在 `DocYjsGateway` 中鉴权后建立同步通道并落库。

### 8.2 如何通过插件化机制设计一个可扩展的协同文档编辑器？插件系统需要具备哪些特性？

-   回答思路：
-   插件分层：核心层负责文档模型、命令系统和基础扩展能力，业务层负责自定义块和交互，本项目中 `core` 定义底层，`web` 注入 `mention` 和 `AI block`。
-   扩展接口：需要允许新增 block spec、inline content spec、UI controller 和命令入口，而不是把所有业务写死在编辑器内核中。
-   解耦设计：扩展应该尽量通过 Schema 和扩展点接入，而不是直接修改底层逻辑，这样才能保证系统持续演进。
-   生命周期：复杂插件通常还要考虑渲染时机、数据绑定、快捷键、菜单项和事件订阅，这些能力在 `Tiptap + React` 组合里比较适合实现。
-   安全与性能：插件系统要防止某个扩展直接破坏编辑器核心状态，同时要避免过多插件导致渲染和交互性能下降。
-   结合项目可举例说明：`Mention` 是自定义 inline content，`AI` 是自定义 block，二者都没有修改底层核心类，而是通过扩展方式接入。

### 8.3 如何在协同文档编辑中实现实时同步与冲突解决？需要重点考虑哪些技术难点？

-   回答思路：
-   同步机制：常见方案是 OT 或 CRDT，本项目采用 `Yjs` 的 CRDT，因为它更适合分布式实时协作场景。
-   冲突处理：多人同时编辑时一定会有并发冲突，CRDT 的价值就在于通过数学结构保证各副本最终一致。
-   网络问题：真实协同场景中需要考虑断线重连、延迟抖动、临时离线和重新同步，本项目的 `WebsocketProvider` 和服务端同步逻辑已经覆盖了基础同步链路。
-   光标与感知：协同体验不只有文本同步，还包括用户在线状态和远程光标信息，本项目使用 awareness 机制维护协作者信息。
-   持久化：如果只有内存同步而没有数据库落库，服务一重启数据就会丢失，本项目通过 `y-postgresql` 把 update 写入数据库。
-   结合项目可举例说明：`provider.awareness` 负责远程用户感知，`setupWSConnection` 负责同步消息广播，`bindState` 负责历史状态恢复。

### 8.4 如何设计和实现协同文档编辑器的文档引用关系图谱？需要哪些技术支持？

-   回答思路：
-   数据结构：关系图本质是“节点 + 边”，节点代表页面，边代表引用关系，本项目中节点来自 `page` 表，边来自文档 mention。
-   数据提取：引用关系不是单独存一张关系表，而是从 Yjs 文档 XML 中反向解析出来，这也是项目比较有代表性的地方。
-   数据接口：后端通过 `/page/graph` 聚合页面列表与引用关系，并把 links 一起返回给前端。
-   图形渲染：前端使用 `@xyflow/react` 绘制节点边，再通过 `d3-force` 做力导向布局，让图谱更自然。
-   动态更新：理想情况下图谱应随着文档引用变化自动刷新，本项目当前已经具备后端聚合和前端渲染基础。
-   结合项目可举例说明：`yjsXmlMentionCollect` 负责从 XML 中提取 mention id，`DocGraph` 负责把这些关系转换成节点和边。

### 8.5 如何实现协同文档编辑器的私有化部署与数据安全？需要考虑哪些关键点？

-   回答思路：
-   私有化部署：系统要能独立部署在企业自己的服务器环境中，当前项目已经明确要求通过 `JWT_SECRET`、`PG_*`、`SERVER_PORT`、`DIFY_*` 等环境变量完成关键配置。
-   数据隔离：业务元数据、权限数据、评论通知和协同数据都需要进入企业自有 PostgreSQL，避免依赖外部 SaaS 存储。
-   身份认证：文档系统至少要有登录鉴权能力，本项目基于 `Passport + JWT + Bearer Token` 提供认证机制，并在 WS 通道补了鉴权。
-   数据演进：真实生产环境不应依赖 ORM 自动同步表结构，本项目已经改用 migration 管理表结构。
-   数据备份：私有化方案中要考虑数据库备份、快照保留、日志审计和服务恢复策略，这些是企业场景的重要要求。
-   结合项目可举例说明：当前项目已具备本地 PostgreSQL、服务端 API、协同落库、快照恢复和 Docker 基础脚本，是继续演进私有化部署方案的良好基础。

### 8.6 如何为协同文档设计成员权限与操作位模型？

-   回答思路：
-   第一层是角色，负责定义大多数成员的默认能力，例如 `owner`、`editor`、`commenter`、`viewer`。
-   第二层是操作位，用来补充“这个角色之外的特殊授权”，例如 `member_manage`、`comment_moderate`、`template_manage`。
-   服务端不要把权限判断分散到每个接口里，最好统一抽象成 `assertAction()` 一类入口，本项目就是通过 `PageAccessService` 来做的。
-   这样做的好处是：新增接口时只需要声明“这个动作需要什么权限”，而不是每次都手写一遍角色判断。
-   前端权限页也能与后端模型一一对应，减少“前端一套术语、后端一套术语”的沟通成本。

### 8.7 如何在 Yjs 持久化文档上构建搜索索引、快照与回收站？

-   回答思路：
-   第一，文档主内容存在 Yjs 里，不适合每次查询都直接遍历，所以要把搜索索引单独落到关系型表中。
-   第二，索引内容可以通过“读取 Yjs 文档 -> 提取纯文本 -> 合并标签文本 -> 写入索引表”的方式构建，本项目通过搜索任务和定时处理来完成。
-   第三，快照本质上可以直接保存当前 Yjs 状态编码，恢复时清空房间并回写那份状态即可。
-   第四，回收站不要立刻物理删除，而是先做软删除，再通过定时任务清理超过保留期的数据。
-   这三类能力放在一起的关键是：都围绕同一份文档状态展开，但要把“在线协同”“查询检索”“恢复回滚”“数据清理”分开处理，避免相互干扰。
