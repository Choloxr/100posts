import { z } from "zod";
import { MODE_KEYS, type ModeKey } from "@/lib/modes/catalog";

const modeKeySchema = z.enum(MODE_KEYS as unknown as [ModeKey, ...ModeKey[]]);

/** One variant: copy for 4 slides + Instagram caption + CTA line. */
export const variantCopySchema = z.object({
  mode_key: modeKeySchema,
  cover_headline: z.string().min(1).max(80),
  cover_sub: z.string().min(1).max(120),
  specs_title: z.string().min(1).max(60),
  specs_bullets: z.array(z.string().min(1).max(80)).min(3).max(5),
  price_main: z.string().min(1).max(40),
  price_sub: z.string().min(1).max(100),
  cta_title: z.string().min(1).max(80),
  cta_sub: z.string().min(1).max(120),
  instagram_caption: z.string().min(1).max(2200),
  instagram_cta: z.string().min(1).max(120),
});

export type VariantCopy = z.infer<typeof variantCopySchema>;

export const copyBatchSchema = z.object({
  variants: z.array(variantCopySchema).length(3),
});

export type CopyBatch = z.infer<typeof copyBatchSchema>;

/** Ordena las tres variantes según la corrida elegida (3 modos). */
export function orderVariants(batch: CopyBatch, modeOrder: ModeKey[]): VariantCopy[] {
  if (modeOrder.length !== 3) {
    throw new Error("Se requieren exactamente 3 modos");
  }
  const byKey = new Map(batch.variants.map((v) => [v.mode_key, v]));
  return modeOrder.map((k) => {
    const v = byKey.get(k);
    if (!v) throw new Error(`Falta copy para el modo ${k}`);
    return v;
  });
}
