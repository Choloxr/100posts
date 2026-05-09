import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEV_AUTH_COOKIE } from "@/lib/auth/dev-credentials";
import { ProductForm } from "@/components/product-form";
import { parseVisualProfile, defaultModesFromProfile } from "@/lib/visual/profile";

export default async function NewProductPage() {
  const cookieStore = await cookies();
  const hasDevSession = cookieStore.get(DEV_AUTH_COOKIE)?.value === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !hasDevSession) redirect("/login");

  if (!user && hasDevSession) {
    const defaultModes = defaultModesFromProfile(parseVisualProfile(null));
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
            Modo temporal activo: podés cargar datos y probar flujo UI.
          </p>
        </div>
        <ProductForm defaultModes={defaultModes} />
      </div>
    );
  }

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
