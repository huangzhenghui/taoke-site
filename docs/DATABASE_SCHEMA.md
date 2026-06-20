# 数据库 Schema

当前 Prisma schema 只是数据库准备层，用于约定第一版数据结构。

现有前台页面、后台只读页面和 service 仍然读取 mock 数据，不会连接数据库，也不会执行真实迁移。

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
- 第三方配置和原始结构类字段使用 `Json`。
- `slug`、`outerItemId` 等常用查询字段已添加唯一约束或索引。
- `createdAt` 使用 `@default(now())`。
- `updatedAt` 使用 `@updatedAt`。

## 后续迁移顺序

1. 完善 Prisma schema。
2. 准备 seed 数据，把当前 mock 数据映射入数据库。
3. 将 product/article/category/seo-page service 从 mock 读取切换为数据库读取。
4. 在后台增加新增、编辑、下线等管理功能。
5. 接入外部 Adapter，同步商品、优惠券和转链数据。

在完成 seed 和 service 切换前，不应删除 mock 数据。
