import Link from "next/link";

import { siteConfig } from "@/lib/site";

const currentYear = new Date().getFullYear();

const footerLinks = [
  { href: "/about", label: "关于我们" },
  { href: "/contact", label: "联系我们" },
  { href: "/disclaimer", label: "免责声明" },
  { href: "/privacy", label: "隐私说明" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-6 text-sm text-zinc-500 sm:px-8 lg:px-12">
        <div className="space-y-2">
          <p className="font-semibold text-zinc-950">{siteConfig.siteName}</p>
          <p>本站为导购内容站，不直接销售商品。</p>
        </div>

        <nav
          aria-label="合规页面"
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          {footerLinks.map((link) => (
            <Link
              className="text-zinc-600 transition-colors hover:text-zinc-950"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1">
          <p>{siteConfig.icpText}</p>
          <p>
            © {currentYear} {siteConfig.siteName}
          </p>
        </div>
      </div>
    </footer>
  );
}
