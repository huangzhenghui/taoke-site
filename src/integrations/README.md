# Integrations

外部接口集成目录。

当前阶段只提供 Adapter 类型和 mock 实现，不接入轻淘客、阿里妈妈或淘宝联盟真实接口。

## 为什么使用 Adapter

淘客平台的接口字段、鉴权方式、转链规则和错误格式都不一致。项目内部页面和业务模块不应该直接依赖某一个第三方接口。

Adapter 的作用是把外部数据源统一成项目内部可理解的商品结构和方法：

- `searchProducts`：搜索商品。
- `getProductDetail`：查询外部商品详情。
- `convertLink`：生成推广链接、券链接和淘口令。

## 调用边界

页面不能直接调用第三方接口。

推荐调用方向：

```text
页面
-> 业务模块
-> ProductSourceAdapter
-> 轻淘客 / 阿里妈妈 / mock 实现
```

禁止调用方向：

```text
页面
-> 第三方 API
```

## 当前实现

- `shared`：统一 Adapter 类型、请求参数类型、返回类型。
- `qingtaoke`：`QingtaokeMockAdapter`，使用现有 mock 商品数据。
- `alimama`：`AlimamaMockAdapter`，使用现有 mock 商品数据。

两个 mock adapter 都不会发起真实网络请求。

## 后续真实接口接入

接入轻淘客时，在 `qingtaoke` 目录中新增真实 adapter，例如 `QingtaokeApiAdapter`，实现同一个 `ProductSourceAdapter` 接口。

接入阿里妈妈 / 淘宝联盟时，在 `alimama` 目录中新增真实 adapter，例如 `AlimamaApiAdapter`，实现同一个 `ProductSourceAdapter` 接口。

真实接口的 app key、secret、pid、adzone、推广位等配置必须从环境变量读取，不能写死在代码里。
