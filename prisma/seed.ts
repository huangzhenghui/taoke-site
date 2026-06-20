import { Prisma, PrismaClient } from "@prisma/client";

import { mockArticles } from "../src/modules/article";
import { mockCategories } from "../src/modules/category";
import { mockProducts } from "../src/modules/product";
import { mockSeoPages } from "../src/modules/seo-page";

const prisma = new PrismaClient();

function toDate(value: string) {
  return new Date(value);
}

async function seedCategories() {
  for (const category of mockCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        sortOrder: category.sortOrder,
        status: category.status,
        createdAt: toDate(category.createdAt),
        updatedAt: toDate(category.updatedAt),
      },
      update: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        sortOrder: category.sortOrder,
        status: category.status,
        updatedAt: toDate(category.updatedAt),
      },
    });
  }
}

async function seedProducts() {
  for (const product of mockProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        platform: product.platform,
        source: product.source,
        outerItemId: product.outerItemId,
        title: product.title,
        shortTitle: product.shortTitle,
        description: product.description,
        mainImage: product.mainImage,
        price: new Prisma.Decimal(product.price),
        finalPrice: new Prisma.Decimal(product.finalPrice),
        couponAmount: new Prisma.Decimal(product.couponAmount),
        commissionRate: new Prisma.Decimal(product.commissionRate),
        shopName: product.shopName,
        categoryId: product.categoryId,
        categorySlug: product.categorySlug,
        categoryName: product.categoryName,
        promotionUrl: product.promotionUrl,
        couponUrl: product.couponUrl,
        status: product.status,
        createdAt: toDate(product.createdAt),
        updatedAt: toDate(product.updatedAt),
      },
      update: {
        platform: product.platform,
        source: product.source,
        outerItemId: product.outerItemId,
        title: product.title,
        shortTitle: product.shortTitle,
        description: product.description,
        mainImage: product.mainImage,
        price: new Prisma.Decimal(product.price),
        finalPrice: new Prisma.Decimal(product.finalPrice),
        couponAmount: new Prisma.Decimal(product.couponAmount),
        commissionRate: new Prisma.Decimal(product.commissionRate),
        shopName: product.shopName,
        categoryId: product.categoryId,
        categorySlug: product.categorySlug,
        categoryName: product.categoryName,
        promotionUrl: product.promotionUrl,
        couponUrl: product.couponUrl,
        status: product.status,
        updatedAt: toDate(product.updatedAt),
      },
    });
  }
}

async function seedArticles() {
  for (const article of mockArticles) {
    await prisma.article.upsert({
      where: { id: article.id },
      create: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        content: article.content,
        coverImage: article.coverImage,
        categoryId: article.categoryId,
        categoryName: article.categoryName,
        tags: article.tags,
        relatedProductIds: article.relatedProductIds,
        status: article.status,
        publishedAt: toDate(article.publishedAt),
        createdAt: toDate(article.createdAt),
        updatedAt: toDate(article.updatedAt),
      },
      update: {
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        content: article.content,
        coverImage: article.coverImage,
        categoryId: article.categoryId,
        categoryName: article.categoryName,
        tags: article.tags,
        relatedProductIds: article.relatedProductIds,
        status: article.status,
        publishedAt: toDate(article.publishedAt),
        updatedAt: toDate(article.updatedAt),
      },
    });
  }
}

async function seedSeoPages() {
  for (const seoPage of mockSeoPages) {
    await prisma.seoPage.upsert({
      where: { id: seoPage.id },
      create: {
        id: seoPage.id,
        slug: seoPage.slug,
        title: seoPage.title,
        description: seoPage.description,
        h1: seoPage.h1,
        intro: seoPage.intro,
        keywords: seoPage.keywords,
        categoryId: seoPage.categoryId,
        categoryName: seoPage.categoryName,
        relatedProductIds: seoPage.relatedProductIds,
        relatedArticleIds: seoPage.relatedArticleIds,
        status: seoPage.status,
        createdAt: toDate(seoPage.createdAt),
        updatedAt: toDate(seoPage.updatedAt),
      },
      update: {
        slug: seoPage.slug,
        title: seoPage.title,
        description: seoPage.description,
        h1: seoPage.h1,
        intro: seoPage.intro,
        keywords: seoPage.keywords,
        categoryId: seoPage.categoryId,
        categoryName: seoPage.categoryName,
        relatedProductIds: seoPage.relatedProductIds,
        relatedArticleIds: seoPage.relatedArticleIds,
        status: seoPage.status,
        updatedAt: toDate(seoPage.updatedAt),
      },
    });
  }
}

async function main() {
  await seedCategories();
  await seedProducts();
  await seedArticles();
  await seedSeoPages();

  console.log("Seed completed:");
  console.log(`- Categories: ${mockCategories.length}`);
  console.log(`- Products: ${mockProducts.length}`);
  console.log(`- Articles: ${mockArticles.length}`);
  console.log(`- SEO pages: ${mockSeoPages.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
