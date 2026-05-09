import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runGenerationForProduct } from "@/lib/pipeline/run-generation";
import { parseVisualProfile, defaultModesFromProfile } from "@/lib/visual/profile";
import { parseModeTripleOrDefault } from "@/lib/modes/parse";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string;
      modeKeys?: string[];
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
      .select("visual_profile")
      .eq("user_id", user.id)
      .single();

    const visual = parseVisualProfile(brand?.visual_profile);
    const fallbackModes = defaultModesFromProfile(visual);
    const modeOrder = parseModeTripleOrDefault(body.modeKeys, fallbackModes);

    const { runId } = await runGenerationForProduct({
      userId: user.id,
      productId: body.productId,
      modeOrder,
    });

    return NextResponse.json({ runId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
