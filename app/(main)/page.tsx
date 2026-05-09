import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: brand } = await supabase
    .from("brand_settings")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!brand) {
    redirect("/brand");
  }

  return (
    <div className="fade-up-enter space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-[-0.03em] text-[var(--fg)]">
          Listo para generar
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
          Subí un producto, esperá unos segundos y descargá tres variantes de
          carrusel con caption y CTA.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center rounded-btn bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition-all duration-fast hover:-translate-y-px hover:shadow-glow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
          Nuevo producto
        </Link>
        <Link
          href="/brand"
          className="inline-flex items-center justify-center rounded-btn border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--fg)] transition-all duration-fast hover:border-[var(--accent)]/40 hover:bg-[var(--hover-surface)]"
        >
          Editar marca
        </Link>
      </div>
    </div>
  );
}
