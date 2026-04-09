# 妙码协同文档项目文档

> 说明：本版本按“适合复制到飞书文档”的方式整理，去掉了空行，保留了有序结构和无序结构，重点帮助你从需求、架构、模块关系、实现细节和面试表达几个维度系统理解项目。

## 1. 需求背景介绍

### 1.1 需求背景

-   在企业级场景中，文档系统不只是一个富文本编辑器，还需要承担知识沉淀、多人协作、跨文档引用、结构化组织和数据持久化等职责。
-   市面上的飞书文档、Notion 等产品已经验证了协同文档的价值，但很多企业仍然希望掌握可私有化部署、可定制扩展、可深度集成的编辑器能力。
-   因此，这个项目的目标不是只做一个“编辑器 Demo”，而是搭建一套具备企业级协同文档雏形的完整方案。

### 1.2 项目概述

-   项目名称：`miaoma-docs`
-   项目定位：一个基于 Monorepo 组织的协同文档系统，包含编辑器内核、React 适配层、UI 套件、Web 前端、NestJS 后端和桌面端壳。
-   核心能力：富文本编辑、实时协同编辑、文档列表管理、文档引用关系图谱、自定义块扩展、协同数据持久化。
-   技术主线：前端以 `React + Vite` 为主，编辑器基于 `Tiptap + ProseMirror`，协同层基于 `Yjs`，服务端基于 `NestJS + PostgreSQL`。

### 1.3 核心业务需求

1. 提供完整的富文本编辑能力。

-   支持段落、标题、列表、代码块、表格、文件类内容等基础块级能力。
-   支持工具栏、侧边菜单、建议菜单等常见编辑器交互。

2. 支持多人实时协同编辑。

-   多个用户同时编辑同一文档时，需要保证内容最终一致。
-   需要支持在线状态、远程用户信息和协作感知能力。

3. 支持文档之间的结构化引用。

-   用户可以在文档中通过 `mention` 引用其他页面。
-   系统可以根据引用关系生成文档关系图谱，帮助知识可视化导航。

4. 支持编辑器插件化和二次开发。

-   业务层可以新增自定义 block、inline content 和交互组件。
-   扩展功能时尽量不直接侵入编辑器底层核心代码。

5. 支持企业内部部署与数据持久化。

-   页面元数据需要保存到业务数据库。
-   协同编辑数据需要支持存储、恢复和服务重启后的状态回放。

### 1.4 技术需求

-   编辑器内核要有清晰的 Schema 设计、命令系统和扩展机制。
-   协同层要支持低延迟同步、冲突自动合并、断线重连和持久化存储。
-   服务端要同时支持 REST API 和 WebSocket 协同通道。
-   前端要支持页面路由、接口请求、状态缓存和关系图谱可视化。
-   工程层要支持 Workspace、统一构建、跨包复用和本地开发联调。

## 2. 学习成果

1. 需求分析与架构设计能力。

-   能够理解企业级协同文档系统的业务需求和技术需求。
-   能够从“编辑器内核、协同模块、服务端、前端应用”四层拆解系统架构。

2. 富文本编辑器实现能力。

-   理解 `ProseMirror` 的文档模型与编辑器状态管理方式。
-   理解 `Tiptap` 在 `ProseMirror` 之上的扩展封装方式。
-   能够看懂并分析 `MiaomaDocEditor`、`MiaomaDocSchema`、默认块定义与命令系统。

3. 实时协同实现能力。

-   理解 `Yjs` 的 CRDT 思路以及为什么它适合做多人协同。
-   理解客户端 `Y.Doc`、WebSocket Provider、服务端同步网关和数据库持久化之间的关系。

4. 全栈开发与模块协作能力。

-   能够串联 `React + React Router + React Query + NestJS + TypeORM + PostgreSQL` 的整条业务链路。
-   能够分析一个 Monorepo 项目中 `apps` 和 `packages` 的分层职责。

5. 可视化与扩展能力。

-   能够理解文档引用关系图谱是如何从 mention 数据中提取出来的。
-   能够理解自定义 `mention`、`AI block` 等扩展是如何接入编辑器体系的。

## 3. 学习产物

1. 企业级协同文档编辑器。

-   基于 `Tiptap + ProseMirror + Yjs` 实现的协同文档编辑器。
-   支持文档列表、文档详情、实时协同、引用链接和关系图谱。

2. 编辑器基础 SDK。

-   `@miaoma-doc/core` 提供编辑器 Schema、命令系统、块定义和导入导出能力。
-   `@miaoma-doc/react` 提供 React 接入能力和 UI 控制器。

3. UI 套件与共享组件。

-   `@miaoma-doc/shadcn` 提供编辑器 UI 皮肤。
-   `@miaoma-doc/shadcn-shared-ui` 提供项目级共享 UI 组件。

4. 后端服务模块。

-   `@miaoma-doc/server` 提供用户认证、页面管理、协同网关和图谱接口。
-   协同数据通过 `y-postgresql` 保存到 PostgreSQL。

5. 数据可视化模块。

-   前端通过 `@xyflow/react + d3-force` 构建文档引用关系图谱页面。

6. 项目级学习文档。

-   可从需求背景、模块职责、技术选型、系统架构和面试问答多个角度完整复盘项目。

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

-   简介：`@miaoma-doc/web` 是项目主前端应用，负责页面展示、接口请求、编辑器接入和关系图谱展示。
-   核心职责：实现登录页、文档列表页、文档编辑页、文档图谱页和全局布局。
-   关键依赖：`react-router-dom`，用于前端路由管理。
-   关键依赖：`@tanstack/react-query`，用于服务端状态获取、缓存和失效管理。
-   关键依赖：`axios`，用于 HTTP 请求封装。
-   关键依赖：`@xyflow/react`、`d3-force`，用于文档图谱可视化。
-   关键依赖：`y-websocket`、`yjs`，用于客户端协同连接。
-   核心关系：它依赖 `core + react + shadcn + shared-ui` 四层能力，是项目最终面向用户的主应用。

### 4.6 `@miaoma-doc/server`

-   简介：`@miaoma-doc/server` 是项目主后端服务，基于 NestJS 构建，负责 API 服务、认证、页面管理、协同同步和数据持久化。
-   核心职责：提供认证接口、用户接口、页面 CRUD、图谱接口和文档协同 WebSocket 网关。
-   关键依赖：`@nestjs/common`、`@nestjs/core`、`@nestjs/jwt`、`@nestjs/passport`、`@nestjs/swagger`、`@nestjs/websockets`。
-   关键依赖：`typeorm`、`pg`，用于 PostgreSQL 数据持久化。
-   关键依赖：`passport-local`、`passport-jwt`，用于本地登录与 JWT 鉴权。
-   关键依赖：`yjs`、`y-protocols`、`y-postgresql`，用于协同数据同步与落库。
-   关键依赖：`zod`、`xml-js`、`nanoid`，分别用于参数校验、XML 解析和 ID 生成。
-   学习重点：`apps/backend/server/src/main.ts`、`apps/backend/server/src/app.module.ts`、`apps/backend/server/src/modules/*`、`apps/backend/server/src/fundamentals/yjs-postgresql/*`。

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
-   编辑器技术栈：`Tiptap`、`ProseMirror`、`Yjs`。
-   UI 技术栈：`Tailwind CSS`、`Radix UI`、`shadcn` 风格封装。
-   后端技术栈：`NestJS`、`TypeORM`、`PostgreSQL`、`Passport`、`Zod`。
-   图谱技术栈：`@xyflow/react`、`d3-force`。
-   工程化技术栈：`pnpm workspace`、`Turborepo`、`ESLint`、`Prettier`、`Husky`、`Docker Compose`。

## 5. 系统架构设计与模块关系

### 5.1 整体架构

```text
浏览器 Web 应用
├─ HTTP /api/** -> NestJS Server -> PostgreSQL(业务表)
└─ WS /doc-yjs -> DocYjsGateway -> y-postgresql(PostgreSQL 协同表)
packages/core -> packages/react -> packages/shadcn -> apps/frontend/web
packages/shadcn-shared-ui -> packages/shadcn + apps/frontend/web
apps/frontend/desktop -> 复用 web 产物进行桌面封装
```

### 5.2 Monorepo 分层关系

1. `apps` 层负责“最终运行形态”。

-   `apps/frontend/web` 是主 Web 客户端。
-   `apps/backend/server` 是主业务服务端。
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

-   `src/router/index.tsx` 负责组织 `/doc`、`/doc/:id`、`/doc/graph`、`/account/login`。
-   `src/router/AuthRoute.tsx` 负责登录态拦截。

2. 布局层。

-   `src/layout/index.tsx` 注入 Sidebar 布局和页面 Outlet。
-   `src/components/LayoutAside/Aside.tsx` 负责文档入口、用户信息和文档快捷操作。

3. 页面层。

-   `DocList` 负责文档列表与新建文档。
-   `Doc` 负责文档详情与协同连接。
-   `DocGraph` 负责文档关系图谱可视化。
-   `Account/Login` 负责登录注册。

4. 编辑器接入层。

-   `DocEditor.tsx` 把 `Y.Doc`、`WebsocketProvider`、Schema、自定义块和 SuggestionMenu 连接起来。
-   `Mention` 和 `AI` 是具体业务扩展点。

### 5.4 后端模块关系

1. 启动层。

-   `main.ts` 负责应用创建、全局异常过滤器、WebSocket 适配器和 Swagger。
-   `app.module.ts` 负责装配 `AuthModule`、`UserModule`、`PageModule`、`ApplicationModule`、`DocYjsModule`、`YjsPostgresqlModule`。

2. 认证层。

-   `auth` 模块负责用户名密码登录和 JWT 鉴权。
-   `user` 模块负责注册。

3. 业务层。

-   `page` 模块负责页面创建、更新、查询、删除和图谱接口。
-   `application` 模块负责应用维度的业务实体管理。

4. 协同层。

-   `doc-yjs.gateway.ts` 负责 WebSocket 连接接入。
-   `yjs-postgresql.module.ts` 负责把 Yjs 更新绑定到 PostgreSQL。

### 5.5 核心数据流

1. 登录链路。

-   前端登录页提交用户名和密码。
-   前端通过 `bcryptjs` 对密码做 hash 后发起 `/api/auth/login`。
-   后端 `LocalStrategy -> AuthService -> UserService` 校验用户。
-   登录成功后返回 JWT，前端保存到 `localStorage`。
-   后续请求由 `request.ts` 自动把 `token` 写入请求头。

2. 文档列表与详情链路。

-   前端通过 `fetchPageList` 和 `fetchPageDetail` 请求页面数据。
-   后端 `PageController -> PageService -> TypeORM Repository` 访问 `page` 表。
-   React Query 负责缓存、失效和页面刷新。

3. 协同编辑链路。

-   文档页初始化时创建 `Y.Doc` 和 `WebsocketProvider`。
-   编辑器把当前文档绑定到 `doc.getXmlFragment('document-store-${pageId}')`。
-   用户输入后产生 Yjs update。
-   服务端通过 `setupWSConnection` 广播 update 并写入 PostgreSQL。
-   新用户加入或服务重启后，通过历史 update 回放恢复文档状态。

4. 图谱链路。

-   前端插入 `mention`，其引用信息进入 Yjs XML 文档。
-   后端读取 Yjs 文档对应 XML，使用 `yjsXmlMentionCollect` 提取 mention id。
-   `/api/page/graph` 返回页面和引用关系。
-   前端利用 `d3-force` 计算布局，再由 `@xyflow/react` 渲染节点与边。

## 6. 核心实现与项目亮点

### 6.1 协同编辑实现

-   客户端协同核心在 `apps/frontend/web/src/pages/Doc/index.tsx` 和 `apps/frontend/web/src/pages/Doc/DocEditor.tsx`。
-   服务端协同核心在 `apps/backend/server/src/modules/doc-yjs/doc-yjs.gateway.ts` 和 `apps/backend/server/src/fundamentals/yjs-postgresql/utils.ts`。
-   本项目没有采用传统 OT，而是直接基于 `Yjs` 的 CRDT 思路做同步与冲突合并。
-   协同数据与业务元数据分开存储，业务表保存页面基础信息，Yjs 表保存协同增量更新。

### 6.2 文档关系图谱实现

-   mention 扩展的渲染在前端，关系提取的逻辑在后端。
-   前端 `MentionContent.tsx` 负责把引用页渲染为可跳转链接。
-   后端 `PageService.graph()` 负责读取页面列表并聚合引用关系。
-   图谱页通过 `DocGraph` 组合 `@xyflow/react + d3-force` 实现动态布局和高亮交互。

### 6.3 插件化扩展实现

-   编辑器支持自定义 inline content 和 block spec。
-   当前项目已经落地了 `mention` 和 `AI block` 两个扩展案例。
-   这意味着后续可以继续扩展评论、批注、模板块、数据库块等更复杂能力。

### 6.4 Monorepo 分层亮点

-   `core/react/shadcn/web` 的层次划分比较清晰，便于从“底层能力 -> 适配层 -> UI 层 -> 应用层”逐步理解项目。
-   这种结构适合课程学习，也适合后续把项目演进成真正可复用的编辑器产品体系。

### 6.5 当前项目中值得注意的改进点

-   `jwt.strategy.ts` 当前 `validate` 逻辑仍有进一步完善空间，严格来说应优先基于 `sub` 或用户 ID 回查用户。
-   当前 token 放在 `localStorage` 且通过自定义 `token` 头传递，更标准的生产方案通常是 `Authorization: Bearer xxx`。
-   `BasicAIChatPanel` 中 AI 调用属于演示型接入，生产环境更适合迁移到服务端代理并通过环境变量管理密钥。
-   `TypeORM synchronize: true` 适合开发学习，真实生产环境建议改用 migration。

## 7. 中级/高级项目包装

### 7.1 中级版项目表达

-   技术栈要点：`TypeScript`、`React`、`Tiptap`、`ProseMirror`、`Yjs`、`NestJS`、`PostgreSQL`、`Tailwind CSS`。
-   项目简介：设计并实现了一套支持富文本编辑、实时协同和文档引用关系图谱的协同文档系统，采用 Monorepo 管理前端应用、后端服务和编辑器 SDK。
-   工作内容与成果：基于 `Tiptap + ProseMirror` 封装编辑器内核，支持块级扩展与 React 接入。
-   工作内容与成果：基于 `Yjs + WebSocket + PostgreSQL` 完成多人实时协同编辑与协同数据持久化。
-   工作内容与成果：基于 `React + React Query + @xyflow/react` 实现文档管理界面和文档关系图谱页面。
-   工作内容与成果：基于 `NestJS + TypeORM` 实现用户认证、页面 CRUD、图谱接口和协同网关。

### 7.2 高级版项目表达

-   技术栈要点：`TypeScript`、`Tiptap`、`ProseMirror`、`Yjs`、`React`、`NestJS`、`PostgreSQL`、`Turborepo`、`Tailwind CSS`。
-   项目简介：主导设计了一套面向企业协作场景的协同文档系统，采用“编辑器内核层、React 适配层、UI 皮肤层、业务应用层”分层设计，支持实时协同、引用图谱和可扩展块系统。
-   工作内容与成果：抽象 `packages/core` 作为编辑器内核，统一管理 Schema、命令系统、扩展机制和导入导出能力。
-   工作内容与成果：基于 `Yjs` 构建实时协同链路，并结合 `y-postgresql` 完成协同数据持久化与状态回放。
-   工作内容与成果：构建 `web + server + desktop shell` 的多运行形态，并通过 Monorepo 管理多包共享与协同开发。
-   工作内容与成果：设计文档引用关系图谱，从编辑器 mention 数据提取引用边并可视化展示知识连接结构。

## 8. 面试问题

### 8.1 如何设计和实现一个支持实时协作的协同文档编辑器？设计过程中需要考虑哪些关键技术点？

-   回答思路：
-   架构设计：通常需要把系统拆成编辑器内核、协同同步层、业务服务层和数据存储层，本项目对应 `core`、`Yjs`、`NestJS` 和 `PostgreSQL`。
-   数据同步：协同的关键不是“谁先写谁后写”，而是如何保证最终一致性，本项目基于 `Yjs` 的 CRDT 实现多人实时同步。
-   权限管理：真实企业场景中除了协同，还要考虑谁能查看、编辑、分享和删除文档，本项目当前已有 JWT 登录基础，后续可继续扩展文档级权限模型。
-   扩展能力：协同文档不只是文本输入，还要支持 block 扩展、引用、图谱、AI 助手等能力，因此底层需要插件化设计。
-   持久化：为了防止服务重启或用户重连后数据丢失，本项目使用 `y-postgresql` 把协同更新写入 PostgreSQL。
-   结合项目可举例说明：前端在 `DocEditor` 中把 `Y.Doc` 绑定到 `document-store-${pageId}`，服务端在 `DocYjsGateway` 中建立同步通道并落库。

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
-   私有化部署：系统要能独立部署在企业自己的服务器环境中，本项目已经提供了 `Docker Compose` 基础配置和 PostgreSQL 容器化启动方式。
-   数据隔离：业务元数据和协同数据都需要进入企业自有数据库，避免依赖外部 SaaS 存储。
-   身份认证：文档系统至少要有登录鉴权能力，本项目基于 `Passport + JWT` 提供了基本认证机制。
-   数据备份：私有化方案中要考虑数据库备份、日志审计和服务恢复策略，这些是企业场景的重要要求。
-   传输安全：生产环境通常还需要 HTTPS、标准化 Token 传输、环境变量管理和更严格的权限模型。
-   结合项目可举例说明：当前项目已具备本地 PostgreSQL、服务端 API、协同落库和 Docker 启动脚本，是进一步演进私有化部署方案的良好基础。
