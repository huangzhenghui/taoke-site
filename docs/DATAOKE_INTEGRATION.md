# 大淘客 Dataoke 接入说明

当前 `src/integrations/dataoke` 是大淘客 API 接入骨架，只用于为后续联调预留结构。
项目页面仍然读取 mock service，不会直接调用大淘客真实接口。

## 必要环境变量

真实密钥只能放在本地 `.env`，不要提交到 Git。

```bash
DATAOKE_API_BASE_URL="https://openapi.dataoke.com/api"
DATAOKE_APP_KEY=""
DATAOKE_APP_SECRET=""
DATAOKE_PID=""
DATAOKE_ENABLE_REAL_API="false"
DATAOKE_DEFAULT_VERSION="v1.0.0"
```

`DATAOKE_ENABLE_REAL_API` 默认为 `false`。只有显式设置为 `true` 时，`DataokeClient` 才允许发起真实请求。

## 接入边界

- 页面不能直接调用大淘客 API。
- 前台页面继续通过业务 service 读取内部商品模型。
- 第三方接口只允许通过 `ProductSourceAdapter` 适配层进入系统。
- `appSecret` 只能在服务端参与签名，不能传给浏览器，也不能写入前端组件。
- 当前不写数据库，不做商品同步，不替换 mock 数据。

## 当前模块职责

- `dataoke.config.ts`：读取大淘客环境变量。
- `dataoke.types.ts`：定义大淘客原始响应占位类型。
- `dataoke.mapper.ts`：把大淘客商品映射为内部 `Product`。
- `dataoke.client.ts`：预留请求、鉴权和签名入口。
- `dataoke.adapter.ts`：实现 `ProductSourceAdapter`。

## 第一批计划接入

1. 超级分类。
2. 商品搜索。
3. 商品列表。
4. 高效转链。

## 后续再接入

1. 优惠券查询。
2. 商品更新。
3. 失效商品。
4. 订单查询。

## 后续联调顺序

1. 在 `.env` 填入测试用 `DATAOKE_APP_KEY`、`DATAOKE_APP_SECRET`、`DATAOKE_PID`。
2. 设置 `DATAOKE_ENABLE_REAL_API="true"`。
3. 根据大淘客官方文档补齐签名算法。
4. 根据真实响应结构校准 `DataokeRawProduct` 和 mapper 字段。
5. 先在 adapter 层做手动联调，不要从页面直接发起请求。
6. 稳定后再考虑写入数据库和后台同步任务。

## 当前缺口

- 真实接口 path 需要根据大淘客官方文档确认。
- 签名算法和公共参数需要确认。
- 商品字段、分类字段、转链字段需要用真实响应校准。
- 错误码结构需要根据真实响应统一处理。
