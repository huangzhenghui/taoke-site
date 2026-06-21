import Link from "next/link";

import { getAllArticles } from "@/modules/article";
import { getAllCategories } from "@/modules/category";
import { getAllProducts } from "@/modules/product";
import { getAllPromotionLinks } from "@/modules/promotion-link";
import { getAllSeoPages } from "@/modules/seo-page";

const quickLinks = [
  { href: "/admin/products", label: "商品管理" },
  { href: "/admin/categories", label: "分类管理" },
  { href: "/admin/articles", label: "文章管理" },
  { href: "/admin/topics", label: "专题管理" },
  { href: "/admin/promotion-links", label: "推广链接" },
];

export default function AdminHomePage() {
  const products = getAllProducts();
  const categories = getAllCategories();
  const articles = getAllArticles();
  const seoPages = getAllSeoPages();
  const promotionLinks = getAllPromotionLinks();

  const stats = [
    { label: "商品数量", value: products.length },
    { label: "分类数量", value: categories.length },
    { label: "文章数量", value: articles.length },
    { label: "SEO 专题数量", value: seoPages.length },
    { label: "推广链接数量", value: promotionLinks.length },
  ];

  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-normal">管理后台</h1>
          <p className="text-sm text-zinc-600">
            当前后台只展示 mock 数据，为后续管理功能预留结构。
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              key={stat.label}
            >
              <p className="text-sm text-zinc-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-950">快捷入口</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {quickLinks.map((link) => (
              <Link
                className="rounded-lg border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
