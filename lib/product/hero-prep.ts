import sharp from "sharp";
import { IG_HEIGHT, IG_WIDTH } from "@/lib/render/slide";
import { maybeRemoveProductBackground } from "@/lib/fal/product-enhance";

async function scoreBuffer(buf: Buffer): Promise<number> {
  try {
    const meta = await sharp(buf).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    return w * h;
  } catch {
    return 0;
  }
}

async function scoreDetail(buf: Buffer): Promise<number> {
  try {
    const s = await sharp(buf).rotate().resize(320, 320, { fit: "inside" }).stats();
    const ch = s.channels[0];
    const st = ch?.stdev ?? 0;
    return (s.entropy ?? 0) * 85 + st * 2;
  } catch {
    return 0;
  }
}

/** Elige la mejor foto (resolución + detalle) y devuelve PNG orientado. */
export async function pickBestProductBuffer(buffers: Buffer[]): Promise<Buffer | null> {
  if (!buffers.length) return null;
  let best = buffers[0]!;
  let bestScore = -1;
  for (const b of buffers) {
    const base = await scoreBuffer(b);
    const detail = await scoreDetail(b);
    const sc = base * 0.000001 + detail;
    if (sc > bestScore) {
      bestScore = sc;
      best = b;
    }
  }
  return sharp(best).rotate().png().toBuffer();
}

/** Recorte centrado 4:5 Instagram y tamaño útil para mockup en slides. */
export async function cropToIgPortrait(buf: Buffer): Promise<Buffer> {
  const img = sharp(buf).rotate();
  const meta = await img.metadata();
  const w = meta.width ?? IG_WIDTH;
  const h = meta.height ?? IG_HEIGHT;
  const targetRatio = IG_WIDTH / IG_HEIGHT;
  const cur = w / h;
  let left = 0;
  let top = 0;
  let cw = w;
  let ch = h;
  if (cur > targetRatio) {
    cw = Math.round(h * targetRatio);
    left = Math.round((w - cw) / 2);
  } else if (cur < targetRatio) {
    ch = Math.round(w / targetRatio);
    top = Math.round((h - ch) / 2);
  }
  return img
    .extract({ left, top, width: cw, height: ch })
    .resize(IG_WIDTH, IG_HEIGHT, { fit: "cover" })
    .png()
    .toBuffer();
}

export async function prepareProductHero(buffers: Buffer[]): Promise<Buffer | null> {
  const best = await pickBestProductBuffer(buffers);
  if (!best) return null;
  const cropped = await cropToIgPortrait(best);
  return maybeRemoveProductBackground(cropped);
}
