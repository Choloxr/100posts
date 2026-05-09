import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brand } = await supabase
    .from("brand_settings")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!brand) {
    redirect("/brand");
  }

  return (
    <div className="fade-up-enter mx-auto max-w-lg space-y-8">
      <div className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] transition-colors duration-fast hover:text-[var(--fg)]"
        >
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-[var(--fg)]">
          Nuevo producto
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Elegí el tipo de post, subí fotos si querés y generá tres carruseles con estilos
          automáticos listos para Instagram.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
