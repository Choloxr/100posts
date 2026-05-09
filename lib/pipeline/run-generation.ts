import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { generateCopyBatch } from "@/lib/openai/generate-copy";
import { orderVariants } from "@/lib/templates/copy-schema";
import { generateBackgroundTexture } from "@/lib/fal/texture";
import { renderSlidePng, IG_WIDTH, IG_HEIGHT } from "@/lib/render/slide";
import type { BrandTone } from "@/lib/openai/generate-copy";
import type { ModeKey } from "@/lib/modes/catalog";
import { mergeTokensWithProfile } from "@/lib/modes/tokens";
import { parseVisualProfile, buildProfileHints } from "@/lib/visual/profile";
import { prepareProductHero } from "@/lib/product/hero-prep";

async function downloadProductImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string
): Promise<Buffer | null> {
  const { data, error } = await supabase.storage
    .from("product-images")
    .createSignedUrl(storagePath, 900);
  if (error || !data?.signedUrl) {
    return null;
  }
  const res = await fetch(data.signedUrl);
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

function normalizeHex(color: string): string {
  const c = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  if (/^#[0-9a-fA-F]{3}$/.test(c)) {
    const r = c[1];
    const g = c[2];
    const b = c[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#0f172a";
}

export async function runGenerationForProduct(input: {
  userId: string;
  productId: string;
  modeOrder: [ModeKey, ModeKey, ModeKey];
}): Promise<{ runId: string }> {
  const supabase = await createClient();

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, user_id, name, price, specs, image_paths")
    .eq("id", input.productId)
    .single();

  if (pErr || !product || product.user_id !== input.userId) {
    throw new Error("Producto no encontrado");
  }

  const { data: brand, error: bErr } = await supabase
    .from("brand_settings")
    .select("store_name, primary_color, secondary_color, tone, visual_profile")
    .eq("user_id", input.userId)
    .single();

  if (bErr || !brand) {
    throw new Error("Configurá tu marca antes de generar");
  }

  const primary = normalizeHex(brand.primary_color);
  const secondary = normalizeHex(brand.secondary_color);
  const tone = brand.tone as BrandTone;
  const visualProfile = parseVisualProfile(brand.visual_profile);
  const modeTriple = input.modeOrder;
  const profileHints = buildProfileHints(visualProfile);

  const { data: run, error: rErr } = await supabase
    .from("generation_runs")
    .insert({
      user_id: input.userId,
      product_id: product.id,
      status: "processing",
      mode_keys: [...modeTriple],
    })
    .select("id")
    .single();

  if (rErr || !run) {
    throw new Error("No se pudo crear la corrida");
  }

  const runId = run.id as string;

  try {
    const batch = await generateCopyBatch({
      storeName: brand.store_name,
      tone,
      productName: product.name,
      price: product.price,
      specs: product.specs ?? "",
      modeOrder: modeTriple,
      profileHints,
    });

    const variants = orderVariants(batch, modeTriple);

    const paths = (product.image_paths as string[] | null) ?? [];
    const buffers: Buffer[] = [];
    for (const p of paths) {
      const buf = await downloadProductImage(supabase, p);
      if (buf) buffers.push(buf);
    }

    let productPng: Buffer | null = null;
    if (buffers.length > 0) {
      const hero = await prepareProductHero(buffers);
      if (hero) {
        productPng = await sharp(hero)
          .resize(520, 680, { fit: "inside" })
          .png()
          .toBuffer();
      }
    }

    const textures = await Promise.all(
      variants.map((v) =>
        generateBackgroundTexture({
          primaryColor: primary,
          secondaryColor: secondary,
          modeKey: v.mode_key,
        }).then((buf) =>
          sharp(buf)
            .resize(IG_WIDTH, IG_HEIGHT, { fit: "cover" })
            .jpeg({ quality: 88 })
            .toBuffer()
        )
      )
    );

    for (let vi = 0; vi < variants.length; vi++) {
      const copy = variants[vi]!;
      const textureJpeg = textures[vi]!;
      const modeKey = copy.mode_key;
      const tokens = mergeTokensWithProfile(modeKey, visualProfile);

      const slideBuffers = await Promise.all(
        ([0, 1, 2, 3] as const).map((slide) =>
          renderSlidePng({
            slide,
            copy,
            textureJpeg,
            productPng,
            storeName: brand.store_name,
            primaryColor: primary,
            secondaryColor: secondary,
            modeKey,
            tokens,
          })
        )
      );

      const carouselPaths: string[] = [];
      for (let si = 0; si < slideBuffers.length; si++) {
        const storagePath = `${input.userId}/${runId}/v${vi}-s${si}.png`;
        const buf = slideBuffers[si]!;
        const { error: upErr } = await supabase.storage
          .from("generated-assets")
          .upload(storagePath, buf, {
            contentType: "image/png",
            upsert: true,
          });
        if (upErr) {
          throw new Error(upErr.message);
        }
        carouselPaths.push(storagePath);
      }

      const coverPath = carouselPaths[0] ?? null;

      const { error: oErr } = await supabase.from("generation_outputs").insert({
        run_id: runId,
        variant_index: vi,
        mode_key: copy.mode_key,
        caption: copy.instagram_caption,
        cta: copy.instagram_cta,
        cover_path: coverPath,
        carousel_paths: carouselPaths,
      });

      if (oErr) {
        throw new Error(oErr.message);
      }
    }

    const { error: doneErr } = await supabase
      .from("generation_runs")
      .update({ status: "done" })
      .eq("id", runId);

    if (doneErr) {
      throw new Error(doneErr.message);
    }

    return { runId };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    await supabase
      .from("generation_runs")
      .update({ status: "error", error_message: msg })
      .eq("id", runId);
    throw e;
  }
}
