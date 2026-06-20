import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";
import { getAllArticles } from "@/modules/article";
import { mockCategories } from "@/modules/category";
import { getAllProducts } from "@/modules/product";
import { mockSeoPages } from "@/modules/seo-page";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const articles = getAllArticles();
  const products = getAllProducts();
  const activeCategories = mockCategories.filter(
    (category) => category.status === "active",
  );

  return [
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 1,
      url: getSiteUrl("/"),
    },
    ...products.map((product) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(product.updatedAt),
      priority: 0.8,
      url: getSiteUrl(`/item/${product.id}`),
    })),
    ...articles.map((article) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(article.updatedAt),
      priority: 0.8,
      url: getSiteUrl(`/article/${article.slug}`),
    })),
    ...mockSeoPages.map((seoPage) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(seoPage.updatedAt),
      priority: 0.8,
      url: getSiteUrl(`/topic/${seoPage.slug}`),
    })),
    ...activeCategories.map((category) => ({
      changeFrequency: "daily" as const,
      lastModified: new Date(category.updatedAt),
      priority: 0.7,
      url: getSiteUrl(`/category/${category.slug}`),
    })),
  ];
}
