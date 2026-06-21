# 后台保存流程设计

当前后台新增和编辑页面仍然是表单骨架，用于确认字段、布局和管理路径。
Server Actions 已预留保存入口，但当前不会连接数据库，也不会执行 Prisma 写入。

## 当前状态

- 商品、分类、文章、专题表单已经具备字段布局。
- 保存按钮保持 disabled。
- 列表页和编辑页仍然读取 mock service。
- `app/admin/actions` 中的 Server Actions 只返回占位状态。
- 当前不创建 API route，不做登录，不做真实保存。

## 为什么暂不写数据库

1. 本地 PostgreSQL / Docker 可能尚未在所有开发环境准备好。
2. 当前优先稳定页面结构、字段模型和后台管理路径。
3. 过早把 mock service 全部切换到数据库，会增加调试成本并影响前台展示稳定性。
4. 先保留 mock 数据，可以继续快速验证 SEO 页面、商品页和后台骨架。

## 后续真正保存的顺序

1. 启动 PostgreSQL。
2. 执行 Prisma migrate。
3. 执行 seed，把当前 mock 数据写入数据库。
4. 创建 Prisma Client 封装，避免页面和 action 到处直接实例化 client。
5. Server Actions 接入 Prisma 写入。
6. 表单解除 disabled，并把 form action 接到对应 Server Action。
7. 增加成功和失败提示，包括字段校验错误。
8. 后台列表切换为数据库读取。
9. 前台 service 分阶段从 mock 读取切换为数据库读取。

## 保存路径规划

商品保存路径：

- 新增页面：`/admin/products/new`
- 编辑页面：`/admin/products/{id}/edit`
- 新增 action：`createProductAction`
- 更新 action：`updateProductAction`
- 后续 Prisma model：`Product`

分类保存路径：

- 新增页面：`/admin/categories/new`
- 编辑页面：`/admin/categories/{slug}/edit`
- 新增 action：`createCategoryAction`
- 更新 action：`updateCategoryAction`
- 后续 Prisma model：`Category`

文章保存路径：

- 新增页面：`/admin/articles/new`
- 编辑页面：`/admin/articles/{slug}/edit`
- 新增 action：`createArticleAction`
- 更新 action：`updateArticleAction`
- 后续 Prisma model：`Article`

专题保存路径：

- 新增页面：`/admin/topics/new`
- 编辑页面：`/admin/topics/{slug}/edit`
- 新增 action：`createSeoPageAction`
- 更新 action：`updateSeoPageAction`
- 后续 Prisma model：`SeoPage`

## 接入 Prisma 时的注意事项

- 先做字段校验，再写数据库。
- slug、outerItemId 等唯一字段要处理冲突提示。
- Decimal 金额字段要在 action 中统一转换。
- Json 字段如 tags、keywords、relatedProductIds、relatedArticleIds 要先解析并标准化。
- 写入成功后再考虑 redirect 或 revalidatePath。
- 在后台写入稳定前，不删除 mock 数据。
