# Dataoke Prisma Schema 设计方案

本文档只做 Prisma schema 设计审查和改造方案，不执行 migration，不写入数据库，不修改 `prisma/schema.prisma`。

## 设计原则

- 前台页面不直接请求 Dataoke API。
- Dataoke 商品必须先进入本地数据库。
- 前台只读取本地数据库。
- 商品基础信息和动态数据要尽量分开。
- 推广链接单独存。
- 分类映射单独存。
- 同步日志单独存。
- 人工 SEO 内容不能被自动同步覆盖。
- 不保存 `appSecret`。
- 不保存 `signRan`。
- 不保存完整请求 URL。

## 当前 Schema 现状

### Product

当前已有字段：

- 基础识别：`id`、`platform`、`source`、`outerItemId`
- 商品基础信息：`title`、`shortTitle`、`description`、`mainImage`、`shopName`
- 价格佣金：`price`、`finalPrice`、`couponAmount`、`commissionRate`
- 分类冗余：`categoryId`、`categorySlug`、`categoryName`
- 链接占位：`promotionUrl`、`couponUrl`
- 状态时间：`status`、`createdAt`、`updatedAt`

当前不足：

- 唯一约束是 `platform + outerItemId`，对 Dataoke 更推荐 `source + outerItemId`。
- 商品基础信息和动态指标混在一个表里，第一版可以接受，但后续可以拆 `ProductMetrics`。
- 缺少 Dataoke 专用字段：`dataokeId`、`goodsSign`、`sourceCid`、`sourceSubcid`。
- 缺少店铺和品牌扩展字段：`shopLogo`、`brandName`、`brandId`。
- 缺少图片数组：`images`。
- 缺少优惠券动态字段：`couponConditions`、`couponStartTime`、`couponEndTime`、`couponTotalNum`、`couponReceiveNum`、`couponRemainCount`。
- 缺少销量字段：`monthSales`、`dailySales`、`twoHoursSales`。
- 缺少人工保护字段：`isManualHidden`、`isManualEdited`、`manualCategoryLocked`。
- 缺少同步时间：`lastSyncedAt`。
- `promotionUrl` / `couponUrl` 放在 Product 上会和 PromotionLink 职责重叠，后续可以保留为冗余快照或逐步弱化。

### Category

当前已有字段：

- `id`、`slug`、`name`
- `description`、`seoTitle`、`seoDescription`
- `sortOrder`、`status`
- `createdAt`、`updatedAt`

当前不足：

- 可以承载站内分类，但不适合直接表达 Dataoke cid/subcid 到站内分类的映射关系。
- 缺少第三方来源分类字段，例如 `source`、`sourceCid`、`sourceSubcid`。
- 应新增独立 `SourceCategoryMapping`，不要把第三方分类映射塞进 Category。

### PromotionLink

当前已有字段：

- `id`、`productId`
- `platform`、`source`、`outerItemId`
- `promotionUrl`、`couponUrl`、`tpwd`
- `raw`
- `promotionPositionId`
- `status`
- `createdAt`、`updatedAt`

当前不足：

- 缺少唯一约束，推荐 `productId + source`。
- 缺少 `shortUrl`、`longTpwd`。
- 缺少佣金和价格快照：`maxCommissionRate`、`minCommissionRate`、`originalPrice`、`actualPrice`。
- 缺少优惠券快照：`couponStartTime`、`couponEndTime`、`couponInfo`、`couponTotalCount`、`couponRemainCount`。
- 缺少转链生成时间和过期时间：`lastGeneratedAt`、`expiresAt`。
- `raw` 可以保留，但保存前必须脱敏，不得包含 appSecret、signRan、完整请求 URL、pid。

### ApiSource

当前已有字段：

- `id`、`name`、`type`、`status`
- `config`
- `createdAt`、`updatedAt`

当前不足：

- `config` 不得保存 appSecret、signRan、完整请求 URL。
- 可以保存非敏感配置摘要，例如 endpoint version、启用状态、限流策略。
- 如果后续需要多账号、多 PID、多渠道，应另行设计密钥管理，不建议把真实密钥放在业务库。

### SyncLog

当前已有字段：

- `id`、`source`、`taskType`、`status`
- `message`
- `totalCount`、`successCount`、`failedCount`
- `startedAt`、`finishedAt`、`createdAt`

当前不足：

- 缺少 `params`，无法记录安全的同步参数摘要。
- 缺少 `createdCount`、`updatedCount`、`skippedCount`。
- 缺少 `errorSummary`，失败详情只能挤进 `message`。
- 缺少单条失败记录模型，后续可加 `SyncFailure`。
- 日志必须脱敏，不能包含 appSecret、signRan、完整请求 URL、pid。

## 推荐第一版必须支持的模型

第一版建议至少支持：

- `Product`
- `Category`
- `PromotionLink`
- `SourceCategoryMapping`
- `SyncLog`

`Product` 保存本地商品主体；`PromotionLink` 保存转链结果；`SourceCategoryMapping` 维护 Dataoke 分类和站内分类关系；`SyncLog` 记录同步任务。

## Product 推荐字段

推荐字段：

| 字段 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `String @id @default(cuid())` | 内部 ID |
| `source` | `String` | 固定 `dataoke` |
| `outerItemId` | `String` | Dataoke `goodsId` |
| `dataokeId` | `String?` | Dataoke 内部 id，如接口提供 |
| `goodsSign` | `String?` | 商品签名 |
| `title` | `String` | 商品标题 |
| `shortTitle` | `String` | 短标题，优先 `dtitle` |
| `description` | `String` | 商品描述 |
| `mainImage` | `String` | 主图 |
| `images` | `Json?` | 多图数组 |
| `platform` | `String` | `taobao` / `tmall` 等 |
| `shopName` | `String` | 店铺名 |
| `shopLogo` | `String?` | 店铺 logo |
| `brandName` | `String?` | 品牌名 |
| `brandId` | `String?` | 品牌 ID |
| `price` | `Decimal @db.Decimal(12, 2)` | 原价 |
| `finalPrice` | `Decimal @db.Decimal(12, 2)` | 券后价 |
| `couponAmount` | `Decimal @db.Decimal(12, 2)` | 优惠券金额 |
| `couponConditions` | `String?` | 用券条件 |
| `commissionRate` | `Decimal @db.Decimal(6, 2)` | 佣金比例 |
| `monthSales` | `Int?` | 月销量 |
| `dailySales` | `Int?` | 日销量 |
| `twoHoursSales` | `Int?` | 两小时销量 |
| `couponStartTime` | `DateTime?` | 券开始时间 |
| `couponEndTime` | `DateTime?` | 券结束时间 |
| `couponTotalNum` | `Int?` | 优惠券总数 |
| `couponReceiveNum` | `Int?` | 已领取数量 |
| `couponRemainCount` | `Int?` | 剩余数量 |
| `categoryId` | `String` | 站内分类 ID 或过渡值 |
| `categorySlug` | `String` | 站内分类 slug |
| `categoryName` | `String` | 站内分类名 |
| `sourceCid` | `String?` | Dataoke cid |
| `sourceSubcid` | `String?` | Dataoke subcid |
| `status` | `String` | `active` / `inactive` / `expired` / `hidden` |
| `isManualHidden` | `Boolean @default(false)` | 人工隐藏，不被同步覆盖 |
| `isManualEdited` | `Boolean @default(false)` | 人工编辑保护 |
| `manualCategoryLocked` | `Boolean @default(false)` | 人工分类锁定 |
| `lastSyncedAt` | `DateTime?` | 最后同步时间 |
| `createdAt` | `DateTime @default(now())` | 创建时间 |
| `updatedAt` | `DateTime @updatedAt` | 更新时间 |

推荐唯一约束：

```prisma
@@unique([source, outerItemId])
```

推荐索引：

```prisma
@@index([source])
@@index([status])
@@index([categorySlug])
@@index([sourceCid])
@@index([lastSyncedAt])
@@index([couponEndTime])
```

## PromotionLink 推荐字段

推荐字段：

| 字段 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `String @id @default(cuid())` | 内部 ID |
| `productId` | `String` | 本地 Product ID |
| `source` | `String` | 固定 `dataoke` |
| `outerItemId` | `String` | Dataoke `goodsId` |
| `platform` | `String` | `taobao` |
| `promotionUrl` | `String` | `itemUrl` 或 `shortUrl` |
| `couponUrl` | `String` | `couponClickUrl` |
| `shortUrl` | `String?` | 短链 |
| `tpwd` | `String` | 淘口令 |
| `longTpwd` | `String?` | 长淘口令 |
| `maxCommissionRate` | `Decimal? @db.Decimal(6, 2)` | 最高佣金比例 |
| `minCommissionRate` | `Decimal? @db.Decimal(6, 2)` | 最低佣金比例 |
| `originalPrice` | `Decimal? @db.Decimal(12, 2)` | 转链响应原价 |
| `actualPrice` | `Decimal? @db.Decimal(12, 2)` | 转链响应到手价 |
| `couponStartTime` | `DateTime?` | 券开始时间 |
| `couponEndTime` | `DateTime?` | 券结束时间 |
| `couponInfo` | `String?` | 券信息 |
| `couponTotalCount` | `Int?` | 券总数 |
| `couponRemainCount` | `Int?` | 券剩余数 |
| `status` | `String` | `active` / `inactive` / `expired` |
| `lastGeneratedAt` | `DateTime?` | 最近转链时间 |
| `expiresAt` | `DateTime?` | 链接过期时间 |
| `createdAt` | `DateTime @default(now())` | 创建时间 |
| `updatedAt` | `DateTime @updatedAt` | 更新时间 |

推荐唯一约束：

```prisma
@@unique([productId, source])
```

推荐索引：

```prisma
@@index([source])
@@index([outerItemId])
@@index([status])
@@index([expiresAt])
```

## SourceCategoryMapping 推荐字段

推荐新增模型 `SourceCategoryMapping`：

| 字段 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `String @id @default(cuid())` | 内部 ID |
| `source` | `String` | `dataoke` |
| `sourceCid` | `String` | Dataoke cid |
| `sourceSubcid` | `String?` | Dataoke subcid |
| `sourceName` | `String` | Dataoke 一级分类名 |
| `sourceSubName` | `String?` | Dataoke 二级分类名 |
| `categoryId` | `String` | 站内分类 ID |
| `categorySlug` | `String` | 站内分类 slug |
| `confidence` | `Decimal? @db.Decimal(5, 2)` | 映射置信度 |
| `status` | `String` | `active` / `inactive` |
| `createdAt` | `DateTime @default(now())` | 创建时间 |
| `updatedAt` | `DateTime @updatedAt` | 更新时间 |

推荐唯一约束：

```prisma
@@unique([source, sourceCid, sourceSubcid])
```

推荐索引：

```prisma
@@index([source])
@@index([categorySlug])
@@index([status])
```

分类映射设计：

- Dataoke cid 先进入 `sourceCid`。
- Dataoke subcid 先进入 `sourceSubcid`。
- 第一版没有正式映射时，`categorySlug` 可以使用 `dataoke-{cid}`。
- 后续人工维护映射，例如 Dataoke `cid=8` -> 站内 `digital`。
- Product 同步时优先查 `SourceCategoryMapping`，查不到再使用过渡分类。

## SyncLog 推荐字段

推荐字段：

| 字段 | 类型建议 | 说明 |
| --- | --- | --- |
| `id` | `String @id @default(cuid())` | 内部 ID |
| `source` | `String` | `dataoke` |
| `taskType` | `String` | `search_products` / `sync_categories` / `privilege_link` |
| `status` | `String` | `success` / `failed` / `partial` |
| `params` | `Json?` | 脱敏参数摘要 |
| `startedAt` | `DateTime` | 开始时间 |
| `finishedAt` | `DateTime?` | 结束时间 |
| `totalCount` | `Int` | 总数 |
| `successCount` | `Int` | 成功数 |
| `createdCount` | `Int` | 新增数 |
| `updatedCount` | `Int` | 更新数 |
| `skippedCount` | `Int` | 跳过数 |
| `failedCount` | `Int` | 失败数 |
| `message` | `String?` | 安全摘要 |
| `errorSummary` | `Json?` | 脱敏错误摘要 |
| `createdAt` | `DateTime @default(now())` | 创建时间 |

推荐索引：

```prisma
@@index([source])
@@index([taskType])
@@index([status])
@@index([startedAt])
```

日志安全要求：

- `params` 不允许包含 `appSecret`。
- `params` 不允许包含 `signRan`。
- `params` 不允许包含完整请求 URL。
- `params` 不允许包含 `pid`。
- `errorSummary` 只保存安全错误码、HTTP 状态、响应片段摘要。

## 后续可选模型

这些模型可以后续再加，不建议第一版一次做完：

### ProductSnapshot

用于记录商品字段历史快照，例如价格、标题、券金额的历史变化。适合后续分析价格走势，但第一版会增加写入复杂度。

### ProductMetrics

用于拆分高频变化指标，例如月销量、日销量、两小时销量、券领取数量、剩余数量。适合高频同步，但第一版可以先放在 Product 上。

### SyncFailure

用于保存单条失败记录，包括 `outerItemId`、安全错误码、安全错误摘要。第一版可以先把失败数量和摘要放在 SyncLog。

### SeoContent

用于承载人工 SEO 标题、SEO 描述、导购正文、编辑锁定状态。适合防止自动同步覆盖人工内容，但第一版也可以先通过 Product 上的保护字段过渡。

## 第一版 Migration 建议

本次不要执行 migration。真正改 schema 时建议分批：

### 第一批：补 Product 字段和唯一约束

新增字段：

- `dataokeId String?`
- `goodsSign String?`
- `images Json?`
- `shopLogo String?`
- `brandName String?`
- `brandId String?`
- `couponConditions String?`
- `monthSales Int?`
- `dailySales Int?`
- `twoHoursSales Int?`
- `couponStartTime DateTime?`
- `couponEndTime DateTime?`
- `couponTotalNum Int?`
- `couponReceiveNum Int?`
- `couponRemainCount Int?`
- `sourceCid String?`
- `sourceSubcid String?`
- `isManualHidden Boolean @default(false)`
- `isManualEdited Boolean @default(false)`
- `manualCategoryLocked Boolean @default(false)`
- `lastSyncedAt DateTime?`

新增唯一索引：

- `@@unique([source, outerItemId])`

字段类型建议：

- 金额和比例用 `Decimal`
- 列表和扩展图用 `Json`
- 时间用 `DateTime`
- Dataoke 外部 ID 用 `String`

### 第二批：扩展 PromotionLink

新增字段：

- `shortUrl String?`
- `longTpwd String?`
- `maxCommissionRate Decimal? @db.Decimal(6, 2)`
- `minCommissionRate Decimal? @db.Decimal(6, 2)`
- `originalPrice Decimal? @db.Decimal(12, 2)`
- `actualPrice Decimal? @db.Decimal(12, 2)`
- `couponStartTime DateTime?`
- `couponEndTime DateTime?`
- `couponInfo String?`
- `couponTotalCount Int?`
- `couponRemainCount Int?`
- `lastGeneratedAt DateTime?`
- `expiresAt DateTime?`

新增唯一索引：

- `@@unique([productId, source])`

### 第三批：新增 SourceCategoryMapping

新增模型：

- `SourceCategoryMapping`

新增唯一索引：

- `@@unique([source, sourceCid, sourceSubcid])`

### 第四批：扩展 SyncLog

新增字段：

- `params Json?`
- `createdCount Int @default(0)`
- `updatedCount Int @default(0)`
- `skippedCount Int @default(0)`
- `errorSummary Json?`

### 第五批：再考虑可选模型

根据真实使用情况再决定是否新增：

- `ProductSnapshot`
- `ProductMetrics`
- `SyncFailure`
- `SeoContent`

## 风险提醒

- 不能物理删除失效商品，只能把 `status` 改为 `inactive` / `expired` / `hidden`。
- 不能自动覆盖人工 SEO。
- 不能自动覆盖人工分类。
- 不能自动恢复人工隐藏商品。
- 不能把推广密钥、签名或完整请求 URL 写入日志。
- 推广链接可以入库，但不要写入错误日志敏感字段。
- 不能一次同步太多商品。
- 第一版入库限制为最多 10 条。
- 第一版只做后台手动触发，不做自动全量同步。
- 前台切换数据库读取必须单独设计，不要和 Dataoke 写入混在同一次任务中。

## 第一版 Schema 改造落地记录

当前 `prisma/schema.prisma` 已完成 Dataoke 第一版入库所需的 schema 改造，但尚未执行 migration，尚未写入数据库。

已经落地的模型：

- `Product`
- `Category`
- `PromotionLink`
- `SourceCategoryMapping`
- `SyncLog`

### Product 已落地内容

`Product` 已支持：

- Dataoke 识别字段：`source`、`outerItemId`、`dataokeId`、`goodsSign`
- 商品内容字段：`title`、`shortTitle`、`description`、`mainImage`、`images`
- 平台和店铺字段：`platform`、`shopName`、`shopLogo`、`brandName`、`brandId`
- 价格、优惠和佣金字段：`price`、`finalPrice`、`couponAmount`、`couponConditions`、`commissionRate`
- 销量字段：`monthSales`、`dailySales`、`twoHoursSales`
- 优惠券时间和数量字段：`couponStartTime`、`couponEndTime`、`couponTotalNum`、`couponReceiveNum`、`couponRemainCount`
- 分类字段：`categoryId`、`categorySlug`、`categoryName`、`sourceCid`、`sourceSubcid`
- 人工保护字段：`isManualHidden`、`isManualEdited`、`manualCategoryLocked`
- 同步字段：`lastSyncedAt`
- 与 `PromotionLink` 的一对多关系：`promotionLinks`

已落地唯一约束：

```prisma
@@unique([source, outerItemId])
```

### PromotionLink 已落地内容

`PromotionLink` 已支持：

- 与 Product 的关系：`product Product @relation(fields: [productId], references: [id])`
- 转链字段：`promotionUrl`、`couponUrl`、`shortUrl`、`tpwd`、`longTpwd`
- 佣金和价格快照：`maxCommissionRate`、`minCommissionRate`、`originalPrice`、`actualPrice`
- 优惠券快照：`couponStartTime`、`couponEndTime`、`couponInfo`、`couponTotalCount`、`couponRemainCount`
- 生命周期字段：`lastGeneratedAt`、`expiresAt`、`status`

已落地唯一约束：

```prisma
@@unique([productId, source])
```

### SourceCategoryMapping 已落地内容

已新增 `SourceCategoryMapping`，用于把 Dataoke `cid` / `subcid` 映射到站内分类。

已落地唯一约束：

```prisma
@@unique([source, sourceCid, sourceSubcid])
```

### SyncLog 已落地内容

`SyncLog` 已支持：

- `params Json?`
- `createdCount`
- `updatedCount`
- `skippedCount`
- `errorSummary`
- 各 count 字段默认值为 `0`

日志仍必须脱敏，不能保存 `appSecret`、`signRan`、完整请求 URL 或 `pid`。

### 本次暂缓模型

以下模型本次没有新增：

- `ProductMetrics`
- `ProductSnapshot`
- `SeoContent`
- `SyncFailure`

暂缓原因：

- `ProductMetrics`：第一版同步量限制为 10 条，动态指标可以先放在 Product 上，等同步频率提升后再拆表。
- `ProductSnapshot`：历史快照会显著增加写入量和查询复杂度，等价格走势或历史分析需求明确后再做。
- `SeoContent`：当前先用 `isManualEdited`、`isManualHidden`、`manualCategoryLocked` 做基础保护，后续 SEO 编辑能力成熟后再拆。
- `SyncFailure`：第一版失败摘要可先放在 `SyncLog.errorSummary`，等需要逐条失败重试时再拆。

下一步才做：

- 创建 migration。
- 执行本地数据库迁移。
- 重新生成 Prisma Client。
- 实现确认入库 Server Action。
- 在 `/admin/dataoke-sync` 增加“确认入库”按钮。
