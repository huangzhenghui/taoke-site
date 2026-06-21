import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField } from "@/components/admin/FormField";
import type { Category } from "@/modules/category";

const statusOptions = ["active", "inactive"].map((value) => ({
  label: value,
  value,
}));

type CategoryFormProps = {
  title: string;
  description: string;
  category?: Category;
};

export function CategoryForm({
  title,
  description,
  category,
}: CategoryFormProps) {
  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AdminPageHeader description={description} title={title} />

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          当前为后台表单骨架，暂未接入数据库保存功能。
        </p>

        <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              defaultValue={category?.name}
              label="分类名称"
              name="name"
            />
            <FormField
              defaultValue={category?.slug}
              label="slug"
              name="slug"
            />
            <FormField
              defaultValue={category?.description}
              label="分类描述"
              name="description"
              textarea
            />
            <FormField
              defaultValue={category?.seoTitle}
              label="SEO 标题"
              name="seoTitle"
            />
            <FormField
              defaultValue={category?.seoDescription}
              label="SEO 描述"
              name="seoDescription"
              textarea
            />
            <FormField
              defaultValue={category?.sortOrder}
              label="排序"
              name="sortOrder"
              type="number"
            />
            <FormField
              defaultValue={category?.status ?? "active"}
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
