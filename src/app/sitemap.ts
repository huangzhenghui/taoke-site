import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";
import { getPublishedArticles } from "@/modules/article";
import { getActiveCategories } from "@/modules/category";
import {
  getActiveProducts,
  getPublicProductSitemapEntriesFromDb,
} from "@/modules/product";
import { getPublishedSeoPages } from "@/modules/seo-page";

export const dynamic = "force-dynamic";

const eyeProtectionDeskLampTopic = {
  slug: "eye-protection-desk-lamp",
  updatedAt: "2026-07-05T00:00:00.000+08:00",
};

async function getDbProductEntriesSafely() {
  try {
    return await getPublicProductSitemapEntriesFromDb();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const articles = getPublishedArticles();
  const mockProducts = getActiveProducts();
  const dbProducts = await getDbProductEntriesSafely();
  const activeCategories = getActiveCategories();
  const seoPages = getPublishedSeoPages();
  const productEntries = new Map<string, Date>();

  for (const product of mockProducts) {
    productEntries.set(product.id, new Date(product.updatedAt));
  }

  for (const product of dbProducts) {
    productEntries.set(product.id, new Date(product.updatedAt));
  }

  return [
    {
      changeFrequency: "daily",
      lastModified: now,
      priority: 1,
      url: getSiteUrl("/"),
    },
    ...Array.from(productEntries.entries()).map(([id, updatedAt]) => ({
      changeFrequency: "weekly" as const,
      lastModified: updatedAt,
      priority: 0.8,
      url: getSiteUrl(`/item/${id}`),
    })),
    ...articles.map((article) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(article.updatedAt),
      priority: 0.8,
      url: getSiteUrl(`/article/${article.slug}`),
    })),
    ...seoPages.map((seoPage) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(seoPage.updatedAt),
      priority: 0.8,
      url: getSiteUrl(`/topic/${seoPage.slug}`),
    })),
    {
      changeFrequency: "weekly",
      lastModified: new Date(eyeProtectionDeskLampTopic.updatedAt),
      priority: 0.85,
      url: getSiteUrl(`/topic/${eyeProtectionDeskLampTopic.slug}`),
    },
    ...activeCategories.map((category) => ({
      changeFrequency: "daily" as const,
      lastModified: new Date(category.updatedAt),
      priority: 0.7,
      url: getSiteUrl(`/category/${category.slug}`),
    })),
  ];
}
