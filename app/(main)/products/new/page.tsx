import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/product-form";
import { parseVisualProfile, defaultModesFromProfile } from "@/lib/visual/profile";

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brand } = await supabase
    .from("brand_settings")
    .select("id, visual_profile")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!brand) {
    redirect("/brand");
  }

  const defaultModes = defaultModesFromProfile(parseVisualProfile(brand.visual_profile));

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/"
          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)]"
        >
          ← Inicio
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Nuevo producto</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Elegí tres modos de estilo, subí hasta 5 fotos y generá tres carruseles listos para
          publicar.
        </p>
      </div>
      <ProductForm defaultModes={defaultModes} />
    </div>
  );
}
