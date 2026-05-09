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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Listo para generar
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Subí un producto, esperá unos segundos y descargá tres variantes de
          carrusel con caption y CTA.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-fg)] hover:opacity-90"
        >
          Nuevo producto
        </Link>
        <Link
          href="/brand"
          className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--muted-bg)]"
        >
          Editar marca
        </Link>
      </div>
    </div>
  );
}
