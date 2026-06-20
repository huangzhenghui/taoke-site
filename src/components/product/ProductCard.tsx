import type { Product, ProductStatus } from "@/modules/product";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  currency: "CNY",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

const statusLabels: Record<ProductStatus, string> = {
  active: "已上架",
  draft: "草稿",
  expired: "已过期",
  inactive: "已下线",
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div
        aria-label={product.title}
        className="aspect-square bg-zinc-100 bg-cover bg-center"
        role="img"
        style={{ backgroundImage: `url(${product.mainImage})` }}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
            {product.categoryName}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-600">
            {statusLabels[product.status]}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold leading-6 text-zinc-950">
            {product.title}
          </h2>
          <p className="text-sm text-zinc-500">{product.shopName}</p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-500">券后价</p>
              <p className="text-2xl font-semibold text-red-600">
                {currencyFormatter.format(product.finalPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">原价</p>
              <p className="text-sm text-zinc-400 line-through">
                {currencyFormatter.format(product.price)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <span className="text-sm font-medium text-amber-800">优惠券</span>
            <span className="text-sm font-semibold text-amber-900">
              {currencyFormatter.format(product.couponAmount)}
            </span>
          </div>

          <button
            className="h-10 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            type="button"
          >
            查看详情
          </button>
        </div>
      </div>
    </article>
  );
}
