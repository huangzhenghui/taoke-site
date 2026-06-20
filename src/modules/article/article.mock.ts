import type { Article } from "./article.types";

export const mockArticles: Article[] = [
  {
    id: "mock-article-001",
    slug: "home-appliance-buying-guide",
    title: "家用小电器怎么选？电热水壶、台灯等实用好物选购指南",
    summary:
      "整理家用小电器选购要点，覆盖恒温电热水壶、护眼台灯等高频使用场景，适合关注实用性和性价比的家庭用户参考。",
    content:
      "家用小电器优先看安全、材质、使用频率和售后。电热水壶建议关注内胆材质、容量和保温档位；儿童台灯则要重点看照度、频闪控制和桌面占用。选购时不要只看低价，还要结合日常使用场景判断是否真正省心。",
    coverImage: "https://placehold.co/1200x630?text=Home+Appliance+Guide",
    categoryId: "cat-home-appliance",
    categoryName: "家用电器",
    tags: ["家用小电器", "选购指南", "实用好物"],
    relatedProductIds: ["mock-product-001", "mock-product-005"],
    status: "published",
    publishedAt: "2026-06-20T09:00:00.000Z",
    createdAt: "2026-06-20T08:50:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "mock-article-002",
    slug: "office-desk-essentials",
    title: "办公桌面好物推荐：久坐办公椅和桌面装备怎么搭配更舒服",
    summary:
      "面向居家办公和日常通勤人群，推荐人体工学办公椅、桌面照明等基础装备，帮助提升长时间办公的舒适度。",
    content:
      "办公桌面升级不一定要一次买很多东西，优先解决久坐支撑、桌面照明和收纳秩序。人体工学办公椅适合每天久坐的人群，台灯则能改善夜间阅读和写字体验。预算有限时，应先买真正高频使用的装备。",
    coverImage: "https://placehold.co/1200x630?text=Office+Desk+Essentials",
    categoryId: "cat-home",
    categoryName: "家居家装",
    tags: ["办公桌面", "人体工学", "居家办公"],
    relatedProductIds: ["mock-product-003", "mock-product-005"],
    status: "published",
    publishedAt: "2026-06-20T09:10:00.000Z",
    createdAt: "2026-06-20T09:02:00.000Z",
    updatedAt: "2026-06-20T09:10:00.000Z",
  },
  {
    id: "mock-article-003",
    slug: "summer-cleaning-supplies",
    title: "夏季清洁用品怎么买？通勤背包、衣物和居家清爽好物清单",
    summary:
      "夏季高温潮湿，清洁和收纳需求明显增加。本文整理适合夏季使用的通勤、衣物和居家清爽类好物选购思路。",
    content:
      "夏季选购清洁和通勤用品，要关注透气、防泼水、易清洁和轻量化。通勤背包适合选择分区清晰、防泼水的款式；衣物则更适合速干面料。真正值得买的夏季用品，应该能减少打理成本，而不是增加新的负担。",
    coverImage: "https://placehold.co/1200x630?text=Summer+Cleaning+Supplies",
    categoryId: "cat-fashion",
    categoryName: "服饰鞋包",
    tags: ["夏季好物", "清洁用品", "通勤收纳"],
    relatedProductIds: ["mock-product-002", "mock-product-004"],
    status: "draft",
    publishedAt: "2026-06-20T09:20:00.000Z",
    createdAt: "2026-06-20T09:12:00.000Z",
    updatedAt: "2026-06-20T09:20:00.000Z",
  },
  {
    id: "mock-article-004",
    slug: "value-digital-accessories",
    title: "高性价比数码配件怎么挑？桌面、运动和充电场景选购建议",
    summary:
      "从桌面办公、运动恢复和日常充电等场景出发，梳理高性价比数码配件和实用小装备的选择方法。",
    content:
      "数码配件最容易买多，也最容易闲置。挑选时建议先明确使用场景，比如桌面办公、运动放松或外出通勤。高性价比并不等于最低价，而是功能、质量和使用频率之间更均衡。对于按摩器这类产品，还要关注档位、重量和握持体验。",
    coverImage: "https://placehold.co/1200x630?text=Digital+Accessories",
    categoryId: "cat-health",
    categoryName: "个护健康",
    tags: ["数码配件", "高性价比", "运动恢复"],
    relatedProductIds: ["mock-product-006", "mock-product-003"],
    status: "published",
    publishedAt: "2026-06-20T09:30:00.000Z",
    createdAt: "2026-06-20T09:22:00.000Z",
    updatedAt: "2026-06-20T09:30:00.000Z",
  },
];
