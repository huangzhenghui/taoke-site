import { AdminNav } from "@/components/layout/AdminNav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
