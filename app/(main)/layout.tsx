import { Sidebar } from "@/components/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <Sidebar />
      <main className="ml-[260px] min-h-screen">
        <div className="mx-auto max-w-[1180px] px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
