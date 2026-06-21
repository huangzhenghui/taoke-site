import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/ProductForm";
import { getAllCategories } from "@/modules/category";

export const metadata: Metadata = {
  title: "新增商品",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NewProductPage() {
  const categoryOptions = getAllCategories().map((category) => ({
    label: category.name,
    value: category.slug,
  }));

  return (
    <ProductForm
      categoryOptions={categoryOptions}
      description="创建商品的后台表单骨架。"
      title="新增商品"
    />
  );
}
