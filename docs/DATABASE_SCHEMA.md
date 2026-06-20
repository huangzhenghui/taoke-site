# 数据库 Schema

当前 Prisma schema 是数据库准备层，用于约定第一版数据结构。
现有前台页面、后台只读页面和 service 仍然读取 mock 数据，不会因为本地数据库存在而切换读取来源。

## 当前模型

- `Category`：分类。
- `Product`：商品。
- `Article`：导购文章。
- `SeoPage`：SEO 专题页。
- `PromotionLink`：推广链接和转链结果。
- `ApiSource`：外部接口数据源配置。
- `SyncLog`：同步任务日志。

## 字段约定

- 金额字段使用 Prisma `Decimal`。
- `tags`、`keywords`、`relatedProductIds`、`relatedArticleIds` 使用 `Json`。
- `status` 暂时使用 `String`，后续稳定后再考虑 enum。
- 第三方配置和原始返回类字段使用 `Json`。
- `slug`、`outerItemId` 等常用查询字段已添加唯一约束或索引。
- `createdAt` 使用 `@default(now())`。
- `updatedAt` 使用 `@updatedAt`。

## 本地 PostgreSQL

项目根目录提供 `docker-compose.yml`，用于启动本地开发数据库。

```bash
docker compose up -d postgres
```

数据库连接信息：

- 数据库名：`taoke_site`
- 用户名：`postgres`
- 密码：`postgres`
- 端口：`5432`

停止本地数据库：

```bash
docker compose down
```

如需连同本地数据卷一起删除，再执行：

```bash
docker compose down -v
```

## 环境变量

不要提交真实 `.env` 文件。首次本地运行时，从 `.env.example` 创建 `.env`：

```bash
cp .env.example .env
```

当前示例连接串：

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taoke_site?schema=public"
```

## Migration

Prisma schema 修改后，本地开发环境可以执行：

```bash
pnpm db:migrate
```

该命令会连接本地 PostgreSQL 并创建 migration。不要在未确认数据库环境时执行它。

仅生成 Prisma Client，不会连接数据库：

```bash
pnpm db:generate
```

## Seed

seed 脚本位于 `prisma/seed.ts`，会从现有 mock 数据写入数据库：

- `mockCategories` 写入 `Category`
- `mockProducts` 写入 `Product`
- `mockArticles` 写入 `Article`
- `mockSeoPages` 写入 `SeoPage`

seed 使用 `upsert`，可以重复执行，不会重复插入相同 `id` 的数据。

执行 seed 前，需要先启动 PostgreSQL，并完成 migration：

```bash
docker compose up -d postgres
pnpm db:migrate
pnpm db:seed
```

## 后续迁移顺序

1. 完善 Prisma schema。
2. 准备 seed 数据，把当前 mock 数据映射入数据库。
3. 将 product/article/category/seo-page service 从 mock 读取切换为数据库读取。
4. 在后台增加新增、编辑、下线等管理功能。
5. 接入外部 Adapter，同步商品、优惠券和转链数据。

在完成 seed 和 service 切换前，不应删除 mock 数据。
