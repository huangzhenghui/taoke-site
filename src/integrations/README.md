# Integrations

外部接口集成目录。

当前阶段只保留目录结构，不接入真实接口。

约定：

- `shared`：外部接口共用类型、错误结构、adapter 基础约定。
- `qingtaoke`：轻淘客接口 adapter 预留目录。
- `alimama`：阿里妈妈 / 淘宝联盟接口 adapter 预留目录。

后续接入外部接口时，必须先使用 mock adapter，不允许页面或业务模块直接调用真实接口。
