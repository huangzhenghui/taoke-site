import type { Metadata } from "next";

import { ArticleForm } from "@/components/admin/ArticleForm";
import { getAllCategories } from "@/modules/category";

export const metadata: Metadata = {
  title: "新增文章",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NewArticlePage() {
  const categoryOptions = getAllCategories().map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <ArticleForm
      categoryOptions={categoryOptions}
      description="创建导购文章的后台表单骨架。"
      title="新增文章"
    />
  );
}
