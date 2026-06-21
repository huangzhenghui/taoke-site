import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "后台首页" },
  { href: "/admin/products", label: "商品管理" },
  { href: "/admin/categories", label: "分类管理" },
  { href: "/admin/articles", label: "文章管理" },
  { href: "/admin/topics", label: "专题管理" },
  { href: "/admin/promotion-links", label: "推广链接" },
  { href: "/admin/api-test/dataoke", label: "Dataoke 测试" },
  { href: "/admin/dataoke-sync", label: "Dataoke 同步预览" },
  { href: "/", label: "返回前台首页" },
];

export function AdminNav() {
  return (
    <nav
      aria-label="后台导航"
      className="border-b border-zinc-200 bg-zinc-950 text-white"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-5 py-3 sm:px-8 lg:px-12">
        {adminLinks.map((link) => (
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/10"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
