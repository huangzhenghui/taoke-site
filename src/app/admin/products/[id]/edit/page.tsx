import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/ProductForm";
import { getAllCategories } from "@/modules/category";
import { getAllProducts, getProductById } from "@/modules/product";

export const metadata: Metadata = {
  title: "编辑商品",
  robots: {
    follow: false,
    index: false,
  },
};

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  return getAllProducts().map((product) => ({
    id: product.id,
  }));
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const categoryOptions = getAllCategories().map((category) => ({
    label: category.name,
    value: category.slug,
  }));

  return (
    <ProductForm
      categoryOptions={categoryOptions}
      description={`编辑商品：${product.title}`}
      product={product}
      title="编辑商品"
    />
  );
}
