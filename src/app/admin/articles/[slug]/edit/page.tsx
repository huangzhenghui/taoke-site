import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleForm } from "@/components/admin/ArticleForm";
import { getAllArticles, getArticleBySlug } from "@/modules/article";
import { getAllCategories } from "@/modules/category";

export const metadata: Metadata = {
  title: "编辑文章",
  robots: {
    follow: false,
    index: false,
  },
};

type EditArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({
    slug: article.slug,
  }));
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const categoryOptions = getAllCategories().map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <ArticleForm
      article={article}
      categoryOptions={categoryOptions}
      description={`编辑文章：${article.title}`}
      title="编辑文章"
    />
  );
}
