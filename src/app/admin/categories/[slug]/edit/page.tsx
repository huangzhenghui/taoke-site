import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/CategoryForm";
import { getAllCategories, getCategoryBySlug } from "@/modules/category";

export const metadata: Metadata = {
  title: "编辑分类",
  robots: {
    follow: false,
    index: false,
  },
};

type EditCategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({
    slug: category.slug,
  }));
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <CategoryForm
      category={category}
      description={`编辑分类：${category.name}`}
      title="编辑分类"
    />
  );
}
