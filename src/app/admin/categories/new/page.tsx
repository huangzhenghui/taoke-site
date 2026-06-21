import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = {
  title: "新增分类",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NewCategoryPage() {
  return (
    <CategoryForm
      description="创建分类的后台表单骨架。"
      title="新增分类"
    />
  );
}
