import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField } from "@/components/admin/FormField";
import type { SeoPage } from "@/modules/seo-page";

const statusOptions = ["draft", "published", "archived"].map((value) => ({
  label: value,
  value,
}));

type SeoPageFormProps = {
  title: string;
  description: string;
  categoryOptions: { label: string; value: string }[];
  seoPage?: SeoPage;
};

export function SeoPageForm({
  title,
  description,
  categoryOptions,
  seoPage,
}: SeoPageFormProps) {
  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AdminPageHeader description={description} title={title} />

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          当前为后台表单骨架，Server Actions 入口已预留，暂未接入数据库保存功能。
        </p>

        <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField defaultValue={seoPage?.title} label="title" name="title" />
            <FormField defaultValue={seoPage?.slug} label="slug" name="slug" />
            <FormField
              defaultValue={seoPage?.description}
              label="description"
              name="description"
              textarea
            />
            <FormField defaultValue={seoPage?.h1} label="h1" name="h1" />
            <FormField
              defaultValue={seoPage?.intro}
              label="intro"
              name="intro"
              textarea
            />
            <FormField
              defaultValue={seoPage?.keywords.join(", ")}
              label="keywords"
              name="keywords"
              placeholder="多个关键词用逗号分隔"
            />
            <FormField
              defaultValue={seoPage?.categoryId ?? categoryOptions[0]?.value}
              label="分类"
              name="categoryId"
              options={categoryOptions}
            />
            <FormField
              defaultValue={seoPage?.relatedProductIds.join(", ")}
              label="关联商品 ID"
              name="relatedProductIds"
              placeholder="多个 ID 用逗号分隔"
            />
            <FormField
              defaultValue={seoPage?.relatedArticleIds.join(", ")}
              label="关联文章 ID"
              name="relatedArticleIds"
              placeholder="多个 ID 用逗号分隔"
            />
            <FormField
              defaultValue={seoPage?.status ?? "draft"}
              label="状态"
              name="status"
              options={statusOptions}
            />
          </div>

          <div className="mt-6">
            <button
              className="h-10 rounded-md bg-zinc-300 px-4 text-sm font-medium text-zinc-600"
              disabled
              type="button"
            >
              保存功能待接入数据库
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
