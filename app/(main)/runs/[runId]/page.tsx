import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { modeLabel, type ModeKey } from "@/lib/modes/catalog";
import { isPostType, postTypeLabel } from "@/lib/product/post-type";
import { RunRefresh } from "@/components/run-refresh";
import { RunResultsView } from "@/components/run-results-view";

type OutputRow = {
  variant_index: number;
  mode_key: string;
  caption: string;
  cta: string;
  carousel_paths: string[] | null;
};

export default async function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: run, error: runErr } = await supabase
    .from("generation_runs")
    .select("id, user_id, status, error_message, product_id, post_type")
    .eq("id", runId)
    .single();

  if (runErr || !run || run.user_id !== user.id) {
    notFound();
  }

  const { data: outputs } = await supabase
    .from("generation_outputs")
    .select("*")
    .eq("run_id", runId)
    .order("variant_index", { ascending: true });

  const status = run.status as string;

  if (status === "pending" || status === "processing") {
    return (
      <div className="relative mx-auto max-w-xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-8 backdrop-blur">
        <h1 className="text-xl font-semibold tracking-tight">Generando tus posts…</h1>
        <p className="text-sm text-[var(--muted)]">Esto puede tardar un momento.</p>
        <RunRefresh />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="relative mx-auto max-w-xl space-y-4 rounded-2xl border border-red-500/25 bg-[var(--surface)]/90 p-8 backdrop-blur">
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <p className="text-sm text-red-400">{run.error_message}</p>
        <Link
          href="/products/new"
          className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)]"
        >
          Volver a intentar
        </Link>
      </div>
    );
  }

  const rows = (outputs ?? []) as OutputRow[];

  let productName = "Producto";
  const productId = run.product_id as string | null;
  if (productId) {
    const { data: product } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .maybeSingle();
    if (product?.name) productName = String(product.name);
  }

  const postTypeRaw = run.post_type as string | null | undefined;
  const postTypeLabelText =
    postTypeRaw && isPostType(postTypeRaw) ? postTypeLabel(postTypeRaw) : null;

  const signed = await Promise.all(
    rows.map(async (out) => {
      const paths = out.carousel_paths ?? [];
      const slideUrls: string[] = [];
      for (const p of paths) {
        const { data } = await supabase.storage
          .from("generated-assets")
          .createSignedUrl(p, 7200);
        slideUrls.push(data?.signedUrl ?? "");
      }
      return {
        variantIndex: out.variant_index,
        modeLabel: modeLabel(out.mode_key as ModeKey),
        caption: out.caption,
        cta: out.cta,
        slideUrls,
      };
    })
  );

  return (
    <RunResultsView
      runId={runId}
      productName={productName}
      postTypeLabel={postTypeLabelText}
      variants={signed}
    />
  );
}
