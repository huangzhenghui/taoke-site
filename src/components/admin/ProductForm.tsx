import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormField } from "@/components/admin/FormField";
import type { Product } from "@/modules/product";

const platformOptions = ["taobao", "tmall", "jd", "vip", "other"].map(
  (value) => ({ label: value, value }),
);

const sourceOptions = ["manual", "qingtaoke", "alimama", "mock"].map(
  (value) => ({ label: value, value }),
);

const statusOptions = ["draft", "active", "inactive", "expired"].map(
  (value) => ({ label: value, value }),
);

type ProductFormProps = {
  title: string;
  description: string;
  categoryOptions: { label: string; value: string }[];
  product?: Product;
};

export function ProductForm({
  title,
  description,
  categoryOptions,
  product,
}: ProductFormProps) {
  return (
    <main className="px-5 py-8 text-zinc-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AdminPageHeader description={description} title={title} />

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          当前为后台表单骨架，Server Actions 入口已预留，暂未接入数据库保存功能。
        </p>

        <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              defaultValue={product?.title}
              label="商品标题"
              name="title"
            />
            <FormField
              defaultValue={product?.shortTitle}
              label="短标题"
              name="shortTitle"
            />
            <FormField
              defaultValue={product?.description}
              label="商品描述"
              name="description"
              textarea
            />
            <FormField
              defaultValue={product?.mainImage}
              label="主图地址"
              name="mainImage"
              type="url"
            />
            <FormField
              defaultValue={product?.platform ?? "taobao"}
              label="平台"
              name="platform"
              options={platformOptions}
            />
            <FormField
              defaultValue={product?.source ?? "manual"}
              label="来源"
              name="source"
              options={sourceOptions}
            />
            <FormField
              defaultValue={product?.outerItemId}
              label="外部商品 ID"
              name="outerItemId"
            />
            <FormField
              defaultValue={product?.shopName}
              label="店铺名称"
              name="shopName"
            />
            <FormField
              defaultValue={product?.categorySlug ?? categoryOptions[0]?.value}
              label="分类"
              name="categorySlug"
              options={categoryOptions}
            />
            <FormField
              defaultValue={product?.price}
              label="原价"
              name="price"
              type="number"
            />
            <FormField
              defaultValue={product?.finalPrice}
              label="券后价"
              name="finalPrice"
              type="number"
            />
            <FormField
              defaultValue={product?.couponAmount}
              label="优惠券金额"
              name="couponAmount"
              type="number"
            />
            <FormField
              defaultValue={product?.commissionRate}
              label="佣金比例"
              name="commissionRate"
              type="number"
            />
            <FormField
              defaultValue={product?.promotionUrl}
              label="推广链接"
              name="promotionUrl"
              type="url"
            />
            <FormField
              defaultValue={product?.couponUrl}
              label="优惠券链接"
              name="couponUrl"
              type="url"
            />
            <FormField
              defaultValue={product?.status ?? "draft"}
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
