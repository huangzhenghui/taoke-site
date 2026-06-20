import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { getActiveCategories } from "@/modules/category";

const categoryLinks = getActiveCategories()
  .slice(0, 4)
  .map((category) => ({
    href: `/category/${category.slug}`,
    name: category.name,
  }));

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <Link className="text-xl font-semibold text-zinc-950" href="/">
            {siteConfig.siteName}
          </Link>
          <p className="text-sm text-zinc-500">
            {siteConfig.siteDescription}
          </p>
        </div>

        <nav aria-label="站点导航" className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            className="rounded-md bg-zinc-950 px-3 py-2 font-medium text-white"
            href="/"
          >
            首页
          </Link>
          {categoryLinks.map((category) => (
            <Link
              className="rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              href={category.href}
              key={category.href}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
