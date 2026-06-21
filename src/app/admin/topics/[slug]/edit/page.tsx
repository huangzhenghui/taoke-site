import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoPageForm } from "@/components/admin/SeoPageForm";
import { getAllCategories } from "@/modules/category";
import { getAllSeoPages, getSeoPageBySlug } from "@/modules/seo-page";

export const metadata: Metadata = {
  title: "编辑专题",
  robots: {
    follow: false,
    index: false,
  },
};

type EditTopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllSeoPages().map((seoPage) => ({
    slug: seoPage.slug,
  }));
}

export default async function EditTopicPage({
  params,
}: EditTopicPageProps) {
  const { slug } = await params;
  const seoPage = getSeoPageBySlug(slug);

  if (!seoPage) {
    notFound();
  }

  const categoryOptions = getAllCategories().map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <SeoPageForm
      categoryOptions={categoryOptions}
      description={`编辑专题：${seoPage.title}`}
      seoPage={seoPage}
      title="编辑专题"
    />
  );
}
