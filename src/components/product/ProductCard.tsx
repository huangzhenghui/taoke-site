import Link from "next/link";

import {
  generateDealReason,
  getDealReasonSignals,
  getFreshnessLabel,
  type DealReasonSignal,
} from "@/modules/deal";
import type { Product } from "@/modules/product";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  currency: "CNY",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

type ProductCardProps = {
  badgeLabel?: string;
  dealReason?: string;
  product: Product;
  showDealSignals?: boolean;
  showFreshness?: boolean;
  variant?: "default" | "compact";
};

function formatCurrency(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? currencyFormatter.format(value)
    : "暂无";
}

export function ProductCard({
  badgeLabel,
  dealReason,
  product,
  showDealSignals = false,
  showFreshness = true,
  variant = "default",
}: ProductCardProps) {
  const reason = dealReason ?? generateDealReason(product);
  const effectiveBadge =
    badgeLabel ?? (product.couponAmount > 0 ? "有优惠" : "值得看");
  const isCompact = variant === "compact";
  const dealSignals = showDealSignals ? getDealReasonSignals(product) : [];

  return (
    <article className="group flex h-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-col">
      <Link
        aria-label={`查看 ${product.title} 详情`}
        className={`relative min-h-[132px] w-[38%] shrink-0 bg-zinc-100 bg-cover bg-center sm:w-full ${
          isCompact ? "sm:aspect-[4/3]" : "sm:aspect-square"
        }`}
        href={`/item/${product.id}`}
        style={{
          backgroundImage: product.mainImage
            ? `url(${product.mainImage})`
            : undefined,
        }}
      >
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-red-600 shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
          {effectiveBadge}
        </span>
      </Link>

      <div
        className={`flex min-w-0 flex-1 flex-col ${
          isCompact ? "gap-2 p-3 sm:gap-3" : "gap-2 p-3 sm:gap-4 sm:p-4"
        }`}
      >
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Link
              className="max-w-[110px] truncate rounded-lg bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 transition-colors hover:bg-emerald-100 sm:max-w-full sm:px-2.5 sm:py-1"
              href={`/category/${product.categorySlug}`}
            >
              {product.categoryName || "精选好物"}
            </Link>
            {showFreshness ? (
              <span className="shrink-0 text-zinc-400">
                {getFreshnessLabel(product)}
              </span>
            ) : null}
          </div>

          <h2
            className={`line-clamp-2 font-semibold leading-5 text-zinc-950 sm:leading-6 ${
              isCompact ? "text-sm" : "text-sm sm:text-base"
            }`}
          >
            <Link href={`/item/${product.id}`}>{product.title}</Link>
          </h2>

          <p className="truncate text-xs text-zinc-500">
            {product.shopName || "第三方店铺"}
          </p>
        </div>

        <p
          className={`line-clamp-2 rounded-lg bg-zinc-50 text-zinc-700 sm:line-clamp-3 ${
            isCompact
              ? "px-3 py-2 text-xs leading-5"
              : "px-3 py-2 text-xs leading-5 sm:text-sm sm:leading-6"
          }`}
        >
          {reason}
        </p>

        {dealSignals.length > 0 ? (
          <div className="hidden grid-cols-2 gap-2 sm:grid">
            {dealSignals.slice(0, 4).map((signal) => (
              <DealSignalPill
                key={`${signal.label}-${signal.value}`}
                signal={signal}
              />
            ))}
          </div>
        ) : null}

        {dealSignals.length > 0 ? (
          <div className="flex gap-1.5 overflow-hidden sm:hidden">
            {dealSignals.slice(0, 2).map((signal) => (
              <span
                className="min-w-0 truncate rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600"
                key={`${signal.label}-${signal.value}-mobile`}
              >
                {signal.label} {signal.value}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto space-y-2 sm:space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-500">券后价</p>
              <p
                className={`font-semibold text-red-600 ${
                  isCompact ? "text-xl" : "text-xl sm:text-2xl"
                }`}
              >
                {formatCurrency(product.finalPrice)}
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-zinc-500">优惠券</p>
              <p className="text-sm font-semibold text-amber-700">
                {formatCurrency(product.couponAmount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              className="flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 sm:h-10 sm:px-3 sm:text-sm"
              href={`/item/${product.id}`}
            >
              看详情
            </Link>
            <Link
              className="flex h-9 items-center justify-center rounded-lg bg-zinc-950 px-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 sm:h-10 sm:px-3 sm:text-sm"
              href={`/go/${product.id}`}
            >
              领券买
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function DealSignalPill({ signal }: { signal: DealReasonSignal }) {
  const toneClassName: Record<DealReasonSignal["tone"], string> = {
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    red: "border-red-100 bg-red-50 text-red-700",
    zinc: "border-zinc-100 bg-zinc-50 text-zinc-600",
  };

  return (
    <div
      className={`min-w-0 rounded-lg border px-3 py-2 ${toneClassName[signal.tone]}`}
    >
      <p className="text-[11px] font-medium opacity-80">{signal.label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold">{signal.value}</p>
    </div>
  );
}
