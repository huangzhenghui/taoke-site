import type { SeoPage } from "./seo-page.types";

export const mockSeoPages: SeoPage[] = [
  {
    id: "mock-seo-page-001",
    slug: "office-desk-essentials",
    title: "办公桌面好物推荐：久坐办公、桌面照明和收纳装备清单",
    description:
      "整理适合办公桌面使用的实用好物，覆盖人体工学办公椅、护眼台灯和桌面装备，适合居家办公和长期伏案人群参考。",
    h1: "办公桌面好物推荐",
    intro:
      "办公桌面专题优先围绕久坐舒适度、桌面照明和高频使用效率展开，适合后续承接办公好物、居家办公装备等搜索需求。",
    keywords: ["办公桌面好物", "居家办公装备", "人体工学办公椅", "护眼台灯"],
    categoryId: "cat-home",
    categoryName: "办公好物",
    relatedProductIds: ["mock-product-003", "mock-product-005"],
    relatedArticleIds: ["mock-article-002", "mock-article-001"],
    status: "published",
    createdAt: "2026-06-20T10:00:00.000Z",
    updatedAt: "2026-06-20T10:00:00.000Z",
  },
  {
    id: "mock-seo-page-002",
    slug: "summer-cleaning-supplies",
    title: "夏季清洁用品推荐：通勤、衣物和居家清爽好物怎么选",
    description:
      "夏季清洁用品和清爽好物推荐，覆盖速干衣物、防泼水通勤包和日常收纳场景，帮助减少夏季打理负担。",
    h1: "夏季清洁用品推荐",
    intro:
      "夏季专题适合围绕高温、潮湿、出汗和通勤收纳展开，重点推荐易清洁、轻量化、防泼水和速干类实用商品。",
    keywords: ["夏季清洁用品", "夏季好物推荐", "速干衣物", "通勤背包"],
    categoryId: "cat-fashion",
    categoryName: "服饰鞋包",
    relatedProductIds: ["mock-product-002", "mock-product-004"],
    relatedArticleIds: ["mock-article-003"],
    status: "published",
    createdAt: "2026-06-20T10:10:00.000Z",
    updatedAt: "2026-06-20T10:10:00.000Z",
  },
  {
    id: "mock-seo-page-003",
    slug: "rental-home-small-appliances",
    title: "租房实用小家电推荐：便宜好用、不占空间的生活电器清单",
    description:
      "面向租房人群整理实用小家电，重点关注电热水壶、台灯等高频生活用品，适合预算有限又想提升生活便利度的人群。",
    h1: "租房实用小家电推荐",
    intro:
      "租房小家电专题需要关注价格、体积、搬家成本和使用频率。优先选择高频、轻量、好维护的产品，比堆功能更重要。",
    keywords: ["租房小家电", "实用小家电推荐", "电热水壶", "租房好物"],
    categoryId: "cat-home-appliance",
    categoryName: "家用电器",
    relatedProductIds: ["mock-product-001", "mock-product-005"],
    relatedArticleIds: ["mock-article-001"],
    status: "draft",
    createdAt: "2026-06-20T10:20:00.000Z",
    updatedAt: "2026-06-20T10:20:00.000Z",
  },
  {
    id: "mock-seo-page-004",
    slug: "value-digital-accessories",
    title: "高性价比数码配件推荐：桌面办公和运动放松实用装备",
    description:
      "高性价比数码配件选购专题，从桌面办公、运动恢复和日常使用场景出发，筛选更值得关注的实用装备。",
    h1: "高性价比数码配件推荐",
    intro:
      "数码配件专题适合围绕场景而不是参数堆砌来组织内容。优先说明谁适合、解决什么问题、是否高频使用。",
    keywords: ["高性价比数码配件", "数码好物", "桌面配件", "运动恢复"],
    categoryId: "cat-health",
    categoryName: "个护健康",
    relatedProductIds: ["mock-product-006", "mock-product-003"],
    relatedArticleIds: ["mock-article-004", "mock-article-002"],
    status: "published",
    createdAt: "2026-06-20T10:30:00.000Z",
    updatedAt: "2026-06-20T10:30:00.000Z",
  },
];
