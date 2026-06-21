# Dataoke 数据库写入规则

## Implemented manual import rules

The manual confirmation flow is implemented in
`src/modules/dataoke-sync/dataoke-sync.service.ts` and is invoked only by the
`/admin/dataoke-sync` Server Action.

- An import refuses a preview containing more than 10 products with
  `Cannot import more than 10 products at a time.`
- `Product` is deduplicated by the schema-level unique key
  `source + outerItemId`. Existing rows are updated; new rows are created.
- If `isManualHidden` is true, import does not change the product status, so a
  manually hidden product is never made active automatically.
- If `isManualEdited` is true, import does not overwrite `title`,
  `shortTitle`, or `description`.
- If `manualCategoryLocked` is true, import does not overwrite `categoryId`,
  `categorySlug`, or `categoryName`.
- A failed row does not stop the remaining rows. The returned failed item has
  only `outerItemId`, `title`, and a safe message.
- Each confirmation creates and completes a `SyncLog` with `source=dataoke`,
  `taskType=import_products`, `status`, safe filter params, timestamps, total,
  success/create/update/skip/failure counts, and a safe message. It never
  stores `appSecret`, `signRan`, `pid`, or a full request URL.

The public storefront remains decoupled from Dataoke; it does not read the
Dataoke API directly.

### Category mapping resolution

Before Dataoke creates or updates a `Product`, it resolves an active
`SourceCategoryMapping` by `source + sourceCid + sourceSubcid` first, then by
`source + sourceCid` with an empty or null `sourceSubcid`. A matching mapping
supplies `categoryId` and `categorySlug`; its `sourceName` supplies
`categoryName` when available. If no mapping matches, the importer falls back
to `categoryId=dataoke-{cid}` and `categorySlug=dataoke-{cid}`.

An existing Product with `manualCategoryLocked=true` retains its current
`categoryId`, `categorySlug`, and `categoryName` regardless of the resolved
mapping. The Dataoke preview applies the same resolution, so the proposed
category is visible before confirmation.

### Manual batch promotion-link generation

`/admin/dataoke-link-batch` manually generates `PromotionLink` records for at
most 10 active Dataoke Products at a time. It does not run automatically. When
`onlyMissing=true`, it selects only Products with no existing PromotionLink.
The real request is blocked unless `DATAOKE_ENABLE_REAL_API=true`.

The generated link is upserted by `productId + source`. Each batch creates a
safe `SyncLog` with task type `batch_promotion_links`, limit/only-missing
parameters, timestamps, counts, final status, and a safe message. It never
stores or returns `appSecret`, `signRan`, `pid`, or a signed request URL.

本文档用于说明 Dataoke 商品入库规则。当前已实现后台手动确认入库；本次不新增 migration，也不修改 `prisma/schema.prisma`。

## Prisma Schema 检查

当前已有模型：

- `Category`
- `Product`
- `PromotionLink`
- `ApiSource`
- `SyncLog`

结论：当前 schema 基本足够支持第一版 Dataoke 手动入库预览后的最小写入流程。

当前可直接承载：

- `Product` 可保存 Dataoke 商品标准字段，包括平台、来源、外部商品 ID、标题、价格、佣金、店铺、分类、推广链接占位和状态。
- `Category` 可保存 Dataoke 超级分类的一级分类，`slug` 已有唯一约束。
- `PromotionLink` 可保存高效转链结果，包括推广链接、优惠券链接、淘口令、推广位和 `raw`。
- `ApiSource` 可记录数据源配置摘要，但不应保存密钥。
- `SyncLog` 可记录同步任务状态、数量和耗时。

后续可能需要补充，但本次不修改 schema：

- `Product` 当前唯一约束是 `@@unique([platform, outerItemId])`，后续应考虑改为或补充 `source + outerItemId` 唯一约束。
- `Product` 当前没有 `monthSales`、`couponStartTime`、`couponEndTime` 字段，若要追踪销量和券有效期，需要后续补充。
- `Product` 当前没有人工编辑保护字段，例如 `isManualTitle`、`manualSeoTitle`、`isManuallyCategorized`、`hiddenReason`。
- `PromotionLink` 当前没有唯一约束，后续应考虑 `productId + source + outerItemId` 的唯一策略。
- `SyncLog` 当前没有 `skippedCount`、`failedItems`、`safeErrorSummary` 字段，第一版可以把安全摘要写入 `message`，后续再扩展。

## 总体入库原则

- 前台页面不直接请求 Dataoke API。
- Dataoke 商品必须先入本地数据库。
- 前台商品页、分类页、专题页只读取本地数据库。
- 入库前必须先经过 mapper，例如 `mapDataokeProductToProduct`。
- 不保存 `appSecret`。
- 不保存 `signRan`。
- 不保存完整请求 URL。
- 不把 `.env` 内容写入数据库或日志。
- Dataoke 原始响应只在确有排查需求时保存脱敏摘要，默认不保存完整响应。

## Product 写入规则

商品唯一识别规则：

```text
source = "dataoke"
outerItemId = Dataoke goodsId
```

当前 `Product` 表没有 `source + outerItemId` 的 compound unique。第一版写入时应在应用层先按 `source=dataoke` 和 `outerItemId=goodsId` 查询，避免重复插入。后续应考虑在 schema 中增加 `@@unique([source, outerItemId])`。

写入策略：

- 如果不存在：`create`
- 如果已存在：`update`
- 不允许重复插入同一个 Dataoke `goodsId`
- 每次最多处理 10 条，和同步预览保持一致

字段映射规则：

| Product 字段 | Dataoke 来源 | 说明 |
| --- | --- | --- |
| `outerItemId` | `goodsId` | 转成 string |
| `source` | 固定值 | `dataoke` |
| `platform` | `shopType` | `1` 为 `tmall`，其他先按 `taobao` |
| `title` | `title` | 商品标题 |
| `shortTitle` | `dtitle` / `title` | 优先 `dtitle` |
| `description` | `desc` | 商品描述 |
| `mainImage` | `mainPic` | 需要补全 `https:` |
| `price` | `originalPrice` | 原价 |
| `finalPrice` | `actualPrice` | 券后价或到手价 |
| `couponAmount` | `couponPrice` | 优惠券金额 |
| `commissionRate` | `commissionRate` | 佣金比例 |
| `shopName` | `shopName` | 店铺名称 |
| `categoryId` | `cid` 或内部映射结果 | 第一版可先用 Dataoke cid |
| `categorySlug` | `dataoke-{cid}` 或正式映射 slug | 第一版用过渡 slug |
| `categoryName` | cid 映射名 | 无映射时使用“大淘客分类” |
| `promotionUrl` | `itemLink` | 只作为占位，前台不直接跳 |
| `couponUrl` | `couponLink` | 只作为占位，前台不直接跳 |
| `status` | 固定值 | 默认 `active` |

## 字段更新规则

可自动更新字段：

- `price`
- `finalPrice`
- `couponAmount`
- `commissionRate`
- `monthSales`
- `couponStartTime`
- `couponEndTime`
- `mainImage`
- `shopName`
- `status`
- `updatedAt`

其中 `monthSales`、`couponStartTime`、`couponEndTime` 当前模型尚未提供，第一版入库可以暂不保存，后续如需要再补 schema。

不建议自动覆盖字段：

- 人工改过的 `title`
- 人工 SEO 标题
- 人工 SEO 描述
- 人工写的导购内容
- 人工分类调整
- 手动置为 `disabled` / `hidden` 的商品

当前模型没有 manual 保护字段。第一版写入前要约定：如果后台人工编辑功能上线，应先补充人工保护字段或编辑来源字段，再允许同步任务覆盖高风险字段。

## PromotionLink 写入规则

高效转链成功后，写入 `PromotionLink`。

唯一识别建议：

```text
productId
source = "dataoke"
outerItemId = goodsId
```

当前 `PromotionLink` 只有索引，没有唯一约束。第一版应在应用层先查询再 create/update，后续再考虑 schema 级唯一约束。

写入字段：

| PromotionLink 字段 | Dataoke 来源 | 说明 |
| --- | --- | --- |
| `productId` | 内部商品 ID | 必须关联本地商品 |
| `platform` | 固定值 | `taobao` |
| `source` | 固定值 | `dataoke` |
| `outerItemId` | `goodsId` | 转成 string |
| `promotionUrl` | `itemUrl` 或 `shortUrl` | 优先 `itemUrl` |
| `couponUrl` | `couponClickUrl` | 优惠券领取链接 |
| `tpwd` | `tpwd` | 淘口令 |
| `promotionPositionId` | `DATAOKE_PID` 或表单 pid | 不进入日志摘要 |
| `status` | 固定值 | 默认 `active` |
| `updatedAt` | 当前时间 | 由 Prisma 自动维护 |

注意：

- 不在 `rawSummary` 中展示 `pid`。
- 不保存 `appSecret`。
- 不保存 `signRan`。
- `promotionUrl` / `couponUrl` 是业务推广链接，可以保存到数据库。
- `promotionUrl` / `couponUrl` 不要进入错误日志敏感字段。

## Category 写入规则

超级分类接口返回后：

- 一级分类映射为 `Category`
- `id = dataoke-{cid}`
- `slug = dataoke-{cid}`
- `name = cname`
- `description = {cname}相关优惠商品和导购内容`
- `seoTitle = {cname}优惠商品推荐`
- `seoDescription = 精选{cname}相关实用好物、优惠券商品和导购内容`
- `sortOrder = cid`
- `status = active`

后续可以做正式分类映射表：

- Dataoke `cid=8` -> `digital`
- Dataoke `cid=4` -> `home`
- Dataoke `cid=6` -> `food`

本阶段先使用 `dataoke-{cid}` 过渡。

## SyncLog 规则

每次同步任务应记录：

- `source = dataoke`
- `taskType`，例如 `search_products` / `sync_categories` / `privilege_link`
- `status`，例如 `success` / `failed` / `partial`
- `startedAt`
- `finishedAt`
- `totalCount`
- `successCount`
- `failedCount`
- `message`

如果第一版需要 `skippedCount`，但 schema 尚无字段，可以先写入 `message` 的安全摘要中。后续再考虑扩展 schema。

错误日志不允许包含：

- `appSecret`
- `signRan`
- 完整请求 URL
- `pid`
- `.env` 内容

## 同步流程设计

第一版手动同步流程：

1. 后台输入关键词、分类、筛选条件。
2. 调用 Dataoke 搜索接口。
3. `extractDataokeSearchResult` 提取 `list`。
4. `mapDataokeProductToProduct` 映射 `Product`。
5. 页面预览 `productsPreview`。
6. 用户点击“确认入库”。
7. Server Action 执行数据库 upsert。
8. 返回 `createdCount`、`updatedCount`、`skippedCount`、`failedCount`。

## 第一版入库限制

- 每次最多写入 10 条。
- 只支持后台手动触发。
- 不做定时任务。
- 不做自动全量同步。
- 不自动删除商品。
- 不自动接前台首页。
- 不自动批量转链所有商品。
- 不把同步结果立即暴露给前台，前台切换数据库读取需要单独任务。

## 失败处理规则

如果单个商品写入失败：

- 不影响其他商品。
- 记录 `failedItems`。
- 返回 `failedCount`。
- 页面展示安全错误摘要。
- `SyncLog.status` 可记录为 `partial`。

错误信息不得包含敏感信息：

- 不包含 `appSecret`
- 不包含 `signRan`
- 不包含完整请求 URL
- 不包含 `pid`
- 不包含完整原始响应

## 下一步开发建议

下一步再开发：

- `modules/dataoke-sync/dataoke-sync.service.ts`
- `confirmDataokeProductsImportAction`
- `/admin/dataoke-sync` 页面增加“确认入库”按钮
- 入库后再做数据库商品列表检查页

本次不要实现以上写入功能。真正写库前，必须再次确认本文档中的唯一规则、自动更新字段和人工覆盖保护策略。
