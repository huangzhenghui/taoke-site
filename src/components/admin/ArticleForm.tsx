import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField } from "@/components/admin/FormField";
import type { Article } from "@/modules/article";

const statusOptions = ["draft", "published", "archived"].map((value) => ({
  label: value,
  value,
}));

type ArticleFormProps = {
  title: string;
  description: string;
  categoryOptions: { label: string; value: string }[];
  article?: Article;
};

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

export function ArticleForm({
  title,
  description,
  categoryOptions,
  article,
}: ArticleFormProps) {
  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AdminPageHeader description={description} title={title} />

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          当前为后台表单骨架，Server Actions 入口已预留，暂未接入数据库保存功能。
        </p>

        <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField defaultValue={article?.title} label="标题" name="title" />
            <FormField defaultValue={article?.slug} label="slug" name="slug" />
            <FormField
              defaultValue={article?.summary}
              label="摘要"
              name="summary"
              textarea
            />
            <FormField
              defaultValue={article?.content}
              label="正文"
              name="content"
              textarea
            />
            <FormField
              defaultValue={article?.coverImage}
              label="封面图"
              name="coverImage"
              type="url"
            />
            <FormField
              defaultValue={article?.categoryId ?? categoryOptions[0]?.value}
              label="分类"
              name="categoryId"
              options={categoryOptions}
            />
            <FormField
              defaultValue={article?.tags.join(", ")}
              label="标签"
              name="tags"
              placeholder="多个标签用逗号分隔"
            />
            <FormField
              defaultValue={article?.relatedProductIds.join(", ")}
              label="关联商品 ID"
              name="relatedProductIds"
              placeholder="多个 ID 用逗号分隔"
            />
            <FormField
              defaultValue={article?.status ?? "draft"}
              label="状态"
              name="status"
              options={statusOptions}
            />
            <FormField
              defaultValue={toDateTimeLocal(article?.publishedAt)}
              label="发布时间"
              name="publishedAt"
              type="datetime-local"
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
