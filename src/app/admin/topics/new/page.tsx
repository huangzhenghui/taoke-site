import type { Metadata } from "next";

import { SeoPageForm } from "@/components/admin/SeoPageForm";
import { getAllCategories } from "@/modules/category";

export const metadata: Metadata = {
  title: "新增专题",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NewTopicPage() {
  const categoryOptions = getAllCategories().map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <SeoPageForm
      categoryOptions={categoryOptions}
      description="创建 SEO 专题页的后台表单骨架。"
      title="新增专题"
    />
  );
}
