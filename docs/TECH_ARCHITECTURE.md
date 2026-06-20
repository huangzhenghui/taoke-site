# 技术架构

## 技术栈

第一阶段暂定技术栈：

- Next.js：前台页面、后台页面、服务端渲染、路由。
- TypeScript：统一类型约束。
- PostgreSQL：主业务数据库。
- Prisma：数据库 schema、迁移和类型安全查询。
- Redis：缓存、限流、后续任务队列预留。
- Docker Compose：本地开发依赖编排。
- Nginx：生产环境反向代理、静态资源缓存、域名入口。

## 架构原则

项目按“内容站优先、SEO 优先、接口可替换”的原则设计。

核心原则：

- 前台页面必须优先保证搜索引擎可抓取。
- 数据模型优先围绕文章、商品、分类、专题设计。
- 外部淘客能力必须通过 adapter 接入。
- 页面层不能直接调用第三方接口。
- 后台能力只覆盖 MVP 内容维护。
- 不为未来复杂功能提前引入重型框架。

## 建议目录结构

初始化 Next.js 后，建议使用以下目录结构：

```text
.
├── docs/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── (site)/
│   │   │   ├── page.tsx
│   │   │   ├── articles/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   └── topics/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── site/
│   │   ├── admin/
│   │   └── shared/
│   ├── config/
│   ├── lib/
│   │   ├── db/
│   │   ├── redis/
│   │   ├── seo/
│   │   └── utils/
│   ├── modules/
│   │   ├── articles/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── topics/
│   │   └── auth/
│   ├── integrations/
│   │   └── taoke/
│   │       ├── adapters/
│   │       ├── mocks/
│   │       └── types.ts
│   └── types/
├── docker-compose.yml
├── Dockerfile
└── nginx/
```

目录职责：

- `src/app/(site)`：前台 SEO 页面。
- `src/app/admin`：后台管理页面。
- `src/app/api`：后台提交、内部接口和必要的服务端 API。
- `src/modules`：业务模块，放文章、商品、分类、专题的业务逻辑。
- `src/components`：纯 UI 组件，避免直接写数据库查询。
- `src/lib/db`：Prisma client 和数据库通用工具。
- `src/lib/seo`：meta、canonical、结构化数据、面包屑等 SEO 工具。
- `src/integrations/taoke`：外部淘客接口抽象和 mock 实现。
- `prisma`：数据库模型和迁移。
- `nginx`：部署时的反向代理配置。

## 模块划分

### 文章模块

负责导购内容。

核心能力：

- 文章 CRUD。
- 发布和下线。
- slug 管理。
- 文章与分类关联。
- 文章与商品关联。
- SEO 字段管理。

### 商品模块

负责商品资料和优惠信息。

核心能力：

- 商品 CRUD。
- 商品发布和下线。
- 商品价格、券信息、图片、外链维护。
- 商品与分类关联。
- 商品与文章关联。
- 外部平台信息字段预留。

### 分类模块

负责站点栏目结构。

核心能力：

- 分类 CRUD。
- 分类排序。
- 分类启用和停用。
- 分类 slug。
- 分类 SEO 字段。

### 专题模块

负责聚合页。

核心能力：

- 专题 CRUD。
- 专题发布和下线。
- 专题关联文章。
- 专题关联商品。
- 专题 SEO 字段。

### 淘客集成模块

负责隔离第三方接口。

第一阶段只实现 mock adapter：

```text
业务模块 -> TaokeService 接口 -> MockTaokeAdapter
```

后期接真实接口时替换为：

```text
业务模块 -> TaokeService 接口 -> QingtaukeAdapter
业务模块 -> TaokeService 接口 -> TaobaoUnionAdapter
```

页面、后台和业务模块不允许直接依赖第三方接口字段。

## 数据流

### 前台页面数据流

```text
用户访问页面
-> Next.js route
-> server component 或服务端查询函数
-> modules 业务查询
-> Prisma
-> PostgreSQL
-> 渲染 HTML
-> 返回给用户和搜索引擎
```

要求：

- 文章正文、商品标题、价格、优惠信息等主要内容必须在服务端渲染结果中出现。
- 不应让 SEO 核心内容依赖浏览器端请求后再填充。
- 页面需要处理未发布、下线、slug 不存在等情况。

### 后台写入数据流

```text
管理员提交表单
-> admin 页面或 server action
-> 输入校验
-> modules 业务逻辑
-> Prisma
-> PostgreSQL
-> 返回操作结果
```

要求：

- 后台写入必须做服务端校验。
- slug、标题、发布状态等关键字段不能只依赖前端校验。
- 后台保存后应明确返回成功或错误信息。

### 外部接口数据流

第一阶段：

```text
后台或业务任务
-> TaokeService
-> MockTaokeAdapter
-> 返回模拟商品、优惠券、转链数据
```

后期：

```text
后台或业务任务
-> TaokeService
-> 真实 Adapter
-> 第三方 API
-> 标准化为内部数据结构
-> 写入数据库或返回给业务模块
```

要求：

- 第三方 API key、secret、pid、adzone 等配置只能来自环境变量。
- 第三方返回数据必须转换成内部 DTO 后再进入业务模块。
- 真实接口失败不能影响已有内容页正常访问。

## 数据库初步实体

第一阶段建议实体：

- `Article`：文章。
- `Product`：商品。
- `Category`：分类。
- `Topic`：专题。
- `ArticleProduct`：文章和商品关联。
- `TopicArticle`：专题和文章关联。
- `TopicProduct`：专题和商品关联。
- `AdminUser`：后台管理员。

关键通用字段：

- `id`
- `title` 或 `name`
- `slug`
- `status`
- `createdAt`
- `updatedAt`
- `publishedAt`
- `seoTitle`
- `seoDescription`

## Redis 使用边界

第一阶段 Redis 只用于必要的轻量能力或预留。

可以用于：

- 热门页面缓存。
- 简单限流。
- 后台登录 session 或 token 黑名单。
- 后续异步任务队列预留。

暂不用于：

- 核心业务数据主存储。
- 复杂实时排行榜。
- 订单状态同步。

## 部署形态

建议生产请求链路：

```text
浏览器 / 搜索引擎
-> Nginx
-> Next.js 应用
-> PostgreSQL
-> Redis
```

Nginx 职责：

- 域名和 HTTPS 入口。
- 反向代理到 Next.js。
- 静态资源缓存。
- 基础安全响应头。
- 请求体大小限制。

Docker Compose 本地职责：

- 启动 PostgreSQL。
- 启动 Redis。
- 可选启动应用容器。
- 保证新环境可以快速复现。
