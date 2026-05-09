import { fal } from "@fal-ai/client";
import sharp from "sharp";

function enhancementEnabled(): boolean {
  const v = process.env.ENABLE_PRODUCT_ENHANCEMENT?.toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Opcional: remove background vía fal BiRefNet v2 (coste + latencia).
 * Activar con ENABLE_PRODUCT_ENHANCEMENT=true y FAL_KEY.
 */
export async function maybeRemoveProductBackground(buf: Buffer): Promise<Buffer> {
  if (!enhancementEnabled()) {
    return buf;
  }
  const key = process.env.FAL_KEY;
  if (!key) {
    return buf;
  }

  try {
    const resized = await sharp(buf)
      .resize(960, 960, { fit: "inside" })
      .png()
      .toBuffer();

    fal.config({ credentials: key });
    const blob = new Blob([new Uint8Array(resized)], { type: "image/png" });
    const result = await fal.subscribe("fal-ai/birefnet/v2", {
      input: {
        image_url: blob,
        model: "General Use (Light)",
        output_format: "png",
        refine_foreground: true,
      },
    });
    const url = result.data.image?.url;
    if (!url) return buf;
    const res = await fetch(url);
    if (!res.ok) return buf;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return buf;
  }
}
