# 大淘客 Dataoke 接入说明

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

## 后续联调顺序

1. 在本地 `.env` 填入测试用 `DATAOKE_APP_KEY`、`DATAOKE_APP_SECRET`、`DATAOKE_PID`。
2. 保持前台页面不直接调用 Dataoke。
3. 用后台测试页或脚本在服务端调用 adapter。
4. 根据真实响应结构校准 `DataokeRawProduct` 和 mapper 字段。
5. 打开 `DATAOKE_ENABLE_REAL_API="true"` 后，再接入真实 fetch。
6. 稳定后再考虑写入数据库和后台同步任务。

## 当前缺口

- 真实响应的 `code/message/data` 包装结构需要联调确认。
- 商品字段、分类字段、转链字段需要用真实响应校准。
- 真实请求启用后的错误处理、限流、日志和重试策略还未实现。
- 后台 API 测试页、同步任务、数据库写入都不在当前阶段实现。
