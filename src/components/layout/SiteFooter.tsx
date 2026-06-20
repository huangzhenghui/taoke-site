import { siteConfig } from "@/lib/site";

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-zinc-500 sm:px-8 lg:px-12">
        <p className="font-semibold text-zinc-950">{siteConfig.siteName}</p>
        <p>本站为导购内容站，不直接销售商品。</p>
        <p>{siteConfig.icpText}</p>
        <p>
          © {currentYear} {siteConfig.siteName}
        </p>
      </div>
    </footer>
  );
}
