# 大淘客 Dataoke 接入说明

## Manual database import (implemented)

`/admin/dataoke-sync` now supports a second, explicit step after a successful
preview: **确认入库**. The button is visible only when preview products exist.
It calls a Server Action and never lets the browser access Prisma or the
Dataoke API directly.

- Version 1 imports at most 10 previewed products per confirmation.
- The import is manual only; there is no scheduled or automatic sync task.
- Product identity is the database unique key `source + outerItemId`.
  A missing product is created and an existing product is updated.
- Every confirmation writes a `SyncLog` with safe request filters, counts,
  status, timestamps, and a safe result message.
- Logs do not persist `appSecret`, `signRan`, `pid`, or a complete request URL.
- The public storefront still does not request the Dataoke API directly.

`/admin/products` now reads imported `Product` rows from PostgreSQL for
administrative inspection. It supports title/short-title/external-ID search
and source/status filters. `/admin/sync-logs` now reads `SyncLog` records for
Dataoke import tracking, with source/task-type/status filters and display-layer
redaction of sensitive log content. Public pages still use their existing
mock-backed data flow and do not read the database or Dataoke API directly.

Suggested next steps: make the admin product detail/edit pages database-backed,
or add more detailed, safely redacted Dataoke import failure records.

`/admin/category-mappings` now provides a database-backed admin view of
`SourceCategoryMapping` rows, including source/status/search filters. Its
manual initializer creates or updates a small fixed set of Dataoke base
mappings without calling the Dataoke API. A Dataoke `cid` must not become a
long-term SEO category slug directly; future imports should resolve `cid` and
`subcid` through `SourceCategoryMapping` before setting `categorySlug`.

Dataoke preview and manual import now resolve active mappings in this order:
`source + cid + subcid`, then `source + cid` with an empty or null `subcid`.
When no mapping exists, both use `dataoke-{cid}` as the category ID and slug
fallback. Existing products with `manualCategoryLocked=true` retain their
manually assigned category fields.

`/admin/products` now supports category-slug and platform filtering alongside
source/status/search filters, plus read-only data-quality checks. An unmapped
category is identified by a `categorySlug` beginning with `dataoke-` and can be
corrected through `/admin/category-mappings`. Missing title, item ID, final
price, coupon amount, or main image should first be investigated in the mapper
and the corresponding Dataoke response fields. Missing promotion links are
reported from the local `PromotionLink` relation; a future batch link-conversion
task can repair them without changing the product import flow.

当前 `src/integrations/dataoke` 是大淘客 API 接入骨架，只用于为后续联调预留结构。
项目页面仍然读取 mock service，不会直接调用大淘客真实接口。

## 为什么不使用官方旧 SDK

- 官方旧版 `dtk-nodejs-api-sdk` 不作为正式项目依赖，只作为接口理解参考。
- 项目需要统一走自封装 `DataokeClient`，便于控制签名、错误处理、日志、重试和服务端边界。
- 自封装 client 可以避免把 `appSecret` 或第三方请求细节泄漏到浏览器端。
- 第三方商品数据必须通过 `ProductSourceAdapter` 进入系统，不能让页面直接依赖大淘客 SDK。

## 新验签 signRan 规则

新验签规则位于 `dataoke.sign.ts`：

1. 生成 6 位随机数字字符串 `nonce`。
2. 生成毫秒级时间戳字符串 `timer`。
3. 拼接签名原文：

```text
appKey=xxx&timer=xxx&nonce=xxx&key=xxx
```

其中最后的 `key` 对应 `appSecret`。

4. 使用 Node.js `crypto` 对签名原文做 MD5。
5. 将 MD5 结果转成大写。
6. 请求参数名为 `signRan`。

注意：不要打印 `appSecret`，不要把 `appSecret` 写死到代码里。

## 必要环境变量

真实密钥只能放在本地 `.env`，不要提交到 Git。

```bash
DATAOKE_API_BASE_URL="https://openapi.dataoke.com"
DATAOKE_APP_KEY=""
DATAOKE_APP_SECRET=""
DATAOKE_PID=""
DATAOKE_ENABLE_REAL_API="false"
DATAOKE_SIGN_MODE="new"
DATAOKE_GOODS_LIST_VERSION="v1.2.4"
DATAOKE_PRIVILEGE_LINK_VERSION="v1.3.1"
DATAOKE_SUPER_CATEGORY_VERSION="v1.1.0"
DATAOKE_SEARCH_VERSION="v2.1.2"
```

`DATAOKE_ENABLE_REAL_API` 当前保持 `false`。本阶段即使 client 具备签名参数构造能力，也不会真实请求接口。

## 已确认接口

- 商品列表：`/api/goods/get-goods-list`，版本 `v1.2.4`
- 高效转链：`/api/tb-service/get-privilege-link`，版本 `v1.3.1`
- 超级分类：`/api/category/get-super-category`，版本 `v1.1.0`
- 大淘客搜索：`/api/goods/get-dtk-search-goods`，版本 `v2.1.2`

## 接入边界

- 所有 Dataoke API 只能在服务端调用。
- 前台页面不能直接调用 Dataoke API。
- 页面不能读取 `DATAOKE_APP_SECRET`。
- `appSecret` 只能在服务端签名逻辑中使用。
- 当前不写数据库，不做商品同步，不替换 mock 数据。
- 下一阶段才考虑后台 API 测试页或手动联调入口。

## 当前模块职责

- `dataoke.config.ts`：读取大淘客环境变量和版本配置。
- `dataoke.endpoints.ts`：集中定义已确认 endpoint。
- `dataoke.sign.ts`：生成 `nonce`、`timer`、`signRan`。
- `dataoke.types.ts`：定义大淘客原始响应占位类型。
- `dataoke.mapper.ts`：把大淘客商品映射为内部 `Product`。
- `dataoke.client.ts`：构造签名参数和请求 URL，本阶段不执行真实 fetch。
- `dataoke.adapter.ts`：实现 `ProductSourceAdapter`。

## 字段映射原则

Dataoke 原始字段不能直接进入页面。接口返回必须先经过 mapper 转成内部模型：

- 商品数据转成内部 `Product`
- 超级分类转成内部 `Category`
- 高效转链结果转成内部 `PromotionLink`

这样可以避免页面和第三方字段强绑定，也方便后续替换数据源、做缓存、入库和字段校验。

## 商品字段映射

| Dataoke 字段 | 内部 Product 字段 | 说明 |
| --- | --- | --- |
| `goodsId` | `outerItemId` | 外部商品 ID |
| `goodsId` | `id` | 内部 ID 暂用 `dataoke-{goodsId}` |
| `shopType` | `platform` | `1` 映射为 `tmall`，`0` 和其他值暂映射为 `taobao` |
| 固定值 | `source` | 固定为 `dataoke` |
| `title` | `title` | 商品标题 |
| `dtitle` / `title` | `shortTitle` | 优先使用短标题 |
| `desc` | `description` | 商品描述 |
| `mainPic` | `mainImage` | 先经过 `normalizeDataokeImageUrl` |
| `originalPrice` | `price` | 原价 |
| `actualPrice` | `finalPrice` | 券后价或到手价 |
| `couponPrice` | `couponAmount` | 优惠券金额 |
| `commissionRate` | `commissionRate` | 佣金比例 |
| `shopName` | `shopName` | 店铺名称 |
| `cid` | `categoryId` | 大淘客分类 ID |
| `cid` | `categorySlug` | 暂用 `dataoke-{cid}` |
| `cid` | `categoryName` | 暂用简单映射，无法映射时为“大淘客分类” |
| `itemLink` | `promotionUrl` | 推广链接占位 |
| `couponLink` | `couponUrl` | 优惠券链接占位 |

`mainPic` 可能以 `//` 开头，必须补成 `https://` 形式后再进入内部模型。

## 转链字段映射

| Dataoke 字段 | 内部 PromotionLink 字段 | 说明 |
| --- | --- | --- |
| `itemUrl` / `shortUrl` | `promotionUrl` | 优先使用 `itemUrl` |
| `couponClickUrl` | `couponUrl` | 优惠券领取链接 |
| `tpwd` | `tpwd` | 淘口令 |
| 外部传入 | `productId` | 内部商品 ID |
| 外部传入 | `outerItemId` | 大淘客商品 ID |
| 固定值 | `platform` | 暂用 `taobao` |
| 固定值 | `source` | 固定为 `dataoke` |
| 固定值 | `status` | 当前 mapper 默认 `active` |

当前内部 `PromotionLink` 类型还没有 `raw` 字段，完整大淘客转链响应暂不保存。后续如需要排查转链问题，可以在模型中增加 `raw`。

## 分类字段映射

| Dataoke 字段 | 内部 Category 字段 | 说明 |
| --- | --- | --- |
| `cid` | `id` | 暂用 `dataoke-{cid}` |
| `cid` | `slug` | 暂用 `dataoke-{cid}` |
| `cname` | `name` | 分类名称 |
| `cname` | `description` | 生成基础分类说明 |
| `cname` | `seoTitle` | 生成基础 SEO 标题 |
| `cname` | `seoDescription` | 生成基础 SEO 描述 |
| `cid` | `sortOrder` | 数字化后作为排序值 |
| 固定值 | `status` | 当前 mapper 默认 `active` |

大淘客 `cid` 和内部分类当前使用 `dataoke-{cid}` 过渡。后续上线前建议建立正式分类映射表，把大淘客分类映射到站内稳定分类体系。

## 后续联调顺序

1. 在本地 `.env` 填入测试用 `DATAOKE_APP_KEY`、`DATAOKE_APP_SECRET`、`DATAOKE_PID`。
2. 保持前台页面不直接调用 Dataoke。
3. 进入后台测试页 `/admin/api-test/dataoke`。
4. 当前测试页默认不真实请求接口，`DATAOKE_ENABLE_REAL_API=false` 时只展示未启用提示。
5. 真实联调前设置 `DATAOKE_ENABLE_REAL_API="true"`。
6. 真实联调时先测试搜索，再测试分类，最后测试转链。
7. 根据真实响应结构校准 `DataokeRawProduct` 和 mapper 字段。
8. 稳定后再考虑写入数据库和后台同步任务。

当前第一轮真实联调只测试大淘客搜索接口：

- 搜索接口路径：`/api/goods/get-dtk-search-goods`
- 搜索接口版本：`v2.1.2`
- `pageSize` 在服务端限制为最大 `10`
- 页面只展示 `rawSummary`，不返回完整签名 URL
- 页面不展示 `appSecret`、`signRan`、签名原文
- 搜索成功并确认字段映射后，再考虑超级分类
- 超级分类成功后，再考虑高效转链

## 后台测试页

后台测试页路径：`/admin/api-test/dataoke`。

该页面只用于测试大淘客接口签名、请求参数、字段映射和返回结果，不影响前台页面。
页面上的交互表单会调用 Server Actions，Server Actions 再调用 `DataokeClient`。

安全边界：

- 默认不真实请求大淘客接口。
- `DATAOKE_ENABLE_REAL_API=false` 时，页面显示真实接口未启用提示。
- `appSecret` 只在服务端签名逻辑中使用，不返回给页面。
- 不要在浏览器端暴露 `appSecret`。
- 前台页面不能直接调用 Dataoke API。
- 不要把完整签名 URL、`signRan` 或 `appKey` 当作测试结果展示到页面。

## 启用真实接口前检查清单

启用真实接口前，先逐项确认：

1. `.env` 和 `.env.local` 没有被 Git 跟踪，也不会提交。
2. `.env.example` 只保留占位值，不填真实 `appKey`、`appSecret`、`pid`。
3. 不要在截图、聊天记录、Issue、日志或浏览器页面中粘贴 `appSecret`。
4. `DATAOKE_ENABLE_REAL_API` 默认保持 `false`，真实联调时才在本地 `.env` 临时改为 `true`。
5. 第一次真实联调只测试搜索接口，不同时测试分类和转链。
6. 第一次搜索联调 `pageSize` 使用 `10`，降低请求量和排查成本。
7. 搜索接口确认签名、公共参数、响应结构正常后，再决定是否接超级分类。
8. 分类接口确认后，再测试高效转链。
9. 测试页、Server Actions 和 DataokeClient 都只能在服务端处理密钥。
10. 前台页面不能直接调用 Dataoke API，也不能接触 `appSecret`。

真实联调完成后，再评估是否接入超级分类和高效转链；不要在第一次联调时直接进入同步任务或数据库写入。

## HTTP 479 排查记录

后台 Dataoke 搜索测试页曾遇到 `Dataoke API HTTP request failed with status 479.`。本次排查后确认当时主要原因是本地 `appKey` / `appSecret` 配置错误。搜索接口修正配置后已完成真实联调。

当前 Client 已增加安全诊断信息：

- 请求头增加 `Accept: application/json` 和 `User-Agent: taoke-site-dataoke-client/1.0`。
- HTTP 非 2xx 时读取响应文本，但页面只展示 `responseTextPreview` 前 300 个字符。
- 页面只展示 `safeRequestSummary` 和 `safeErrorSummary`，不展示完整 URL、完整 query、完整 `signRan`、`appKey`、`appSecret` 或 `.env` 内容。
- `safeRequestSummary` 只包含 endpoint、version、业务参数 key、部分业务参数预览、是否存在 appKey/appSecret/signRan、nonce/timer/signRan 长度，以及 `signRan` 前 6 位。

如后续再次遇到 479，优先检查：

1. `signRan` 规则是否仍为 `appKey=xxx&timer=xxx&nonce=xxx&key=xxx` 后 MD5 大写。
2. 搜索接口参数大小写是否完全使用 `pageId`、`pageSize`、`keyWords`、`cids`、`sort`、`hasCoupon`。
3. 搜索接口 version 是否为 `v2.1.2`，或当前账号文档是否要求其他版本。
4. `appKey`、`appSecret`、`pid` 是否有效，且只放在本地 `.env`。
5. 当前账号是否仍要求 SDK 旧签名或额外公共参数。
6. 是否被网关或请求头策略拦截，可结合 `contentType` 和 `responseTextPreview` 判断。

第一轮真实联调已经只测试搜索接口，`pageSize` 保持最大 10。搜索稳定后，第二轮联调超级分类；超级分类稳定后，第三轮联调高效转链。

## 超级分类真实联调

第二轮真实联调目标是大淘客超级分类接口：

- path: `/api/category/get-super-category`
- version: `v1.1.0`
- method: `GET`
- 业务参数：无

超级分类接口没有业务参数，适合继续验证公共参数、签名、版本号和网关策略是否稳定。后台测试页只展示 `rawSummary` 和映射后的内部 `Category` 摘要，不展示完整原始响应、不展示完整请求 URL、不展示完整 `signRan`、不展示 `appSecret`。

超级分类返回后必须通过 `mapDataokeSuperCategoryToCategory` 转成内部分类结构：

- `cid` -> `id` / `slug` / `sortOrder`
- `cname` -> `name`
- `cname` -> 生成 `description` / `seoTitle` / `seoDescription`
- 固定 `status=active`

搜索接口和超级分类接口真实联调均已通过后，进入第三轮高效转链真实联调。

## 高效转链真实联调

第三轮真实联调目标是大淘客高效转链接口：

- path: `/api/tb-service/get-privilege-link`
- version: `v1.3.1`
- method: `GET`
- 必填业务参数：`goodsId`
- 可选业务参数：`couponId`、`pid`、`channelId`、`promtionType`、`rebateType`、`specialId`、`externalId`、`xid`、`leftSymbol`、`rightSymbol`、`authId`、`bybtqdyh`、`getTopnRate`

注意 `promtionType` 按大淘客文档拼写保留，不改成 `promotionType`。

`pid` 的处理规则：

- 后台测试页可以手动输入 `pid`。
- 表单未填写 `pid` 时，Server Action 使用服务端 `.env` 中的 `DATAOKE_PID`。
- `pid` 不返回到 `rawSummary`，也不展示到页面诊断结果中。

高效转链返回后必须通过 `mapDataokePrivilegeLinkToPromotionLink` 转成内部 `PromotionLink` 结构。后台测试页只展示映射后的 `productId`、`outerItemId`、`platform`、`source`、`promotionUrl`、`couponUrl`、`tpwd`、`status`，以及安全 `rawSummary`。

高效转链成功后，下一阶段才考虑：

- 将转链结果写入数据库 `PromotionLink`。
- 让后台管理页面读取数据库转链数据。
- 评估是否把 `/go/[productId]` 切到数据库或实时转链策略。
- 增加失败重试、限流、过期链接刷新策略。

## Dataoke 同步预览

Dataoke 三个核心接口已经完成后台真实联调：

1. 搜索接口 `/api/goods/get-dtk-search-goods`
2. 超级分类接口 `/api/category/get-super-category`
3. 高效转链接口 `/api/tb-service/get-privilege-link`

下一阶段先做同步预览，不直接写数据库。后台同步预览页面路径：

- `/admin/dataoke-sync`

同步预览的作用：

- 从大淘客搜索接口拉取商品列表。
- 使用 `extractDataokeSearchResult` 兼容多层 `data` 返回结构。
- 使用 `mapDataokeProductToProduct` 映射成内部 `Product`。
- 只展示将来如果入库会保存的安全字段。
- `pageSize` 服务端强制最大为 `10`，避免首次预览拉取过多数据。

同步预览不会：

- 写入 PostgreSQL。
- 修改 Prisma schema。
- 影响前台页面。
- 让前台页面直接请求 Dataoke。
- 展示完整原始响应、完整请求 URL、完整 `signRan`、`appKey`、`appSecret` 或 `pid`。

预览确认字段无误后，下一阶段再做数据库写入：先定义导入策略和去重规则，再接 Prisma 写入，最后才考虑后台列表切换数据库读取。当前前台页面仍然读取本地 mock/service 数据，不直接请求 Dataoke。

## 数据库写入规则设计

当前已经进入数据库写入规则设计阶段，但仍不真正写库。

写库前必须先确认：

- `docs/DATAOKE_DB_WRITE_RULES.md`
- Product 去重规则
- 自动更新字段
- 不允许自动覆盖的人工字段
- PromotionLink 写入策略
- SyncLog 安全日志规则

第一版写入限制：

- 每次最多写入 10 条。
- 只允许后台手动触发。
- 不做定时任务。
- 不做自动全量同步。
- 不自动删除商品。
- 不自动批量转链所有商品。
- 前台页面仍然读取本地数据，不直接请求 Dataoke。

## 搜索结果结构兼容

搜索接口真实请求成功后，返回结构可能存在多层 `data` 嵌套。页面和 Server Action 不能写死 `raw.data.data.list`，否则会出现接口返回 `msg=ok`，但映射商品为空的问题。

当前通过 `extractDataokeSearchResult` 兼容这些列表路径：

- `raw.data.data.list`
- `raw.data.list`
- `raw.data.data.data.list`
- `raw.result.list`
- `raw.list`

后台测试页调试时只展示结构摘要：

- `detectedListPath`
- `listCount`
- `totalNum`
- `pageId`
- `topLevelKeys`
- `dataKeys`
- `innerDataKeys`
- `firstItemKeys`

不要展示完整原始响应、完整商品原始数据、完整请求 URL、完整 `signRan`、`appKey` 或 `appSecret`。如果 `listCount > 0` 但 `mappedProducts` 为空，优先检查 `mapDataokeProductToProduct` 的字段映射；如果 `listCount = 0`，优先更换关键词、分类或排序参数后再测。

搜索接口返回的 `goodsId` 是后续高效转链的核心参数。`couponId` 可选：如果搜索结果有 `couponId`，高效转链测试时可以一并传入；如果为空，可以先只传 `goodsId` 测试。

后台测试页新增 `searchCandidates`，用于从搜索结果中安全展示转链候选商品。候选商品只包含这些字段：

- `title`
- `dtitle`
- `goodsId`
- `couponId`
- `outerItemId`
- `actualPrice`
- `originalPrice`
- `couponPrice`
- `commissionRate`
- `shopName`
- `couponEndTime`
- `hasCouponLink`
- `hasItemLink`
- `hasQuanMLink`
- `mainPicPreview`

`searchCandidates` 不展示完整原始商品对象，不展示完整推广链接，不展示完整请求 URL，不展示完整 `signRan`，也不展示 `appKey` / `appSecret` / `pid`。

## 当前缺口

- 真实响应的 `code/message/data` 包装结构需要联调确认。
- 商品字段、分类字段、转链字段需要用真实响应校准。
- 真实请求启用后的错误处理、限流、日志和重试策略还未实现。
- 同步任务、数据库写入、`/go/[productId]` 接入真实转链都不在当前阶段实现。
