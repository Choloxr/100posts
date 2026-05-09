import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ runId: string }> }
) {
  const { runId } = await context.params;
  const variantParam = new URL(request.url).searchParams.get("variant");
  const variantFilter =
    variantParam === "0" || variantParam === "1" || variantParam === "2"
      ? Number(variantParam)
      : null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: run, error: runErr } = await supabase
    .from("generation_runs")
    .select("id, user_id, status")
    .eq("id", runId)
    .single();

  if (runErr || !run || run.user_id !== user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (run.status !== "done") {
    return NextResponse.json(
      { error: "La generación aún no está lista" },
      { status: 400 }
    );
  }

  const { data: outputs, error: outErr } = await supabase
    .from("generation_outputs")
    .select("*")
    .eq("run_id", runId)
    .order("variant_index", { ascending: true });

  if (outErr || !outputs?.length) {
    return NextResponse.json({ error: "Sin resultados" }, { status: 400 });
  }

  const filtered =
    variantFilter === null
      ? outputs
      : outputs.filter((o) => o.variant_index === variantFilter);

  if (!filtered.length) {
    return NextResponse.json({ error: "Variante no encontrada" }, { status: 400 });
  }

  const zip = new JSZip();

  for (const out of filtered) {
    const paths = (out.carousel_paths as string[] | null) ?? [];
    let si = 0;
    for (const p of paths) {
      const { data: signed, error: sErr } = await supabase.storage
        .from("generated-assets")
        .createSignedUrl(p, 600);
      if (sErr || !signed?.signedUrl) continue;
      const imgRes = await fetch(signed.signedUrl);
      if (!imgRes.ok) continue;
      const buf = Buffer.from(await imgRes.arrayBuffer());
      zip.file(`variant-${out.variant_index}-slide-${si}.png`, buf);
      si += 1;
    }
    zip.file(
      `variant-${out.variant_index}-caption.txt`,
      String(out.caption ?? "")
    );
    zip.file(`variant-${out.variant_index}-cta.txt`, String(out.cta ?? ""));
  }

  const nodeBuffer = await zip.generateAsync({ type: "nodebuffer" });
  const short = runId.replace(/-/g, "").slice(0, 10);
  const suffix =
    variantFilter !== null ? `-variant-${variantFilter}` : "";

  return new NextResponse(new Uint8Array(nodeBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="100posts-${short}${suffix}.zip"`,
    },
  });
}
