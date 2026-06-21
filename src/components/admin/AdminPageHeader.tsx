import Link from "next/link";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AdminPageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </header>
  );
}
