import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runGenerationForProduct } from "@/lib/pipeline/run-generation";
import { parseVisualProfile, defaultModesFromProfile } from "@/lib/visual/profile";
import { parseModeTripleOrDefault } from "@/lib/modes/parse";
import { isPostType } from "@/lib/product/post-type";
import { pickModesForPostType } from "@/lib/openai/pick-modes-for-post-type";
import type { BrandTone } from "@/lib/openai/generate-copy";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string;
      modeKeys?: string[];
      postType?: string;
    };
    if (!body.productId) {
      return NextResponse.json({ error: "productId requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: brand } = await supabase
      .from("brand_settings")
      .select("visual_profile, tone")
      .eq("user_id", user.id)
      .single();

    const visual = parseVisualProfile(brand?.visual_profile);
    const fallbackModes = defaultModesFromProfile(visual);

    const { data: productRow, error: productErr } = await supabase
      .from("products")
      .select("name, specs, user_id")
      .eq("id", body.productId)
      .single();

    if (productErr || !productRow || productRow.user_id !== user.id) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    let modeOrder = parseModeTripleOrDefault(body.modeKeys, fallbackModes);
    if (body.postType && isPostType(body.postType)) {
      modeOrder = await pickModesForPostType({
        postType: body.postType,
        productName: productRow.name,
        specsSnippet: productRow.specs,
        tone: (brand?.tone as BrandTone | undefined) ?? undefined,
      });
    }

    const { runId } = await runGenerationForProduct({
      userId: user.id,
      productId: body.productId,
      modeOrder,
      postType: body.postType && isPostType(body.postType) ? body.postType : null,
    });

    return NextResponse.json({ runId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
