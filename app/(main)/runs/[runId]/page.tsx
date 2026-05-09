import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { modeLabel, type ModeKey } from "@/lib/modes/catalog";
import { RunRefresh } from "@/components/run-refresh";
import { CopyButton } from "@/components/copy-button";

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
    .select("id, user_id, status, error_message")
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
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Generando</h1>
        <RunRefresh />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <p className="text-sm text-red-500">{run.error_message}</p>
        <Link
          href="/products/new"
          className="inline-block text-sm font-medium text-[var(--accent)] underline"
        >
          Volver a intentar
        </Link>
      </div>
    );
  }

  const rows = (outputs ?? []) as OutputRow[];

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
      return { out, slideUrls };
    })
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/products/new"
            className="text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)]"
          >
            ← Nuevo producto
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Tus 3 posts</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Carruseles 4:5, caption y CTA listos para publicar.
          </p>
        </div>
        <a
          href={`/api/runs/${runId}/zip`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-fg)] hover:opacity-90"
        >
          Descargar ZIP
        </a>
      </div>

      <div className="grid gap-10">
        {signed.map(({ out, slideUrls }, idx) => (
          <section
            key={out.variant_index}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[var(--fg)]">
                Variante {idx + 1}: {modeLabel(out.mode_key as ModeKey)}
              </h2>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={out.caption} label="Copiar caption" />
                <CopyButton text={out.cta} label="Copiar CTA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {slideUrls.map((url, i) =>
                url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Slide ${i + 1}`}
                    className="w-full rounded-lg border border-[var(--border)] object-cover aspect-[4/5]"
                  />
                ) : null
              )}
            </div>
            <details className="mt-4 text-sm text-[var(--muted)]">
              <summary className="cursor-pointer font-medium text-[var(--fg)]">
                Ver caption
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-[var(--fg)]">{out.caption}</p>
              <p className="mt-2 font-medium text-[var(--fg)]">CTA</p>
              <p className="text-[var(--muted)]">{out.cta}</p>
            </details>
          </section>
        ))}
      </div>
    </div>
  );
}
