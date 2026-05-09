import { z } from "zod";
import {
  MODE_KEYS,
  type ModeKey,
  DEFAULT_MODE_TRIPLE,
} from "@/lib/modes/catalog";

const modeKeySchema = z.enum(MODE_KEYS as unknown as [ModeKey, ...ModeKey[]]);

export const visualProfileSchema = z.object({
  default_modes: z.array(modeKeySchema).length(3).optional(),
  typography_scale: z.number().min(0.85).max(1.25).optional(),
  density: z.enum(["compact", "airy"]).optional(),
  cta_style: z.enum(["pill", "underline", "boxed"]).optional(),
  caption_style: z.enum(["short", "standard", "long"]).optional(),
  product_placement: z.enum(["end", "start", "center"]).optional(),
  fal_texture_boost: z.number().min(0).max(1).optional(),
});

export type VisualProfile = z.infer<typeof visualProfileSchema>;

export const EMPTY_VISUAL_PROFILE: VisualProfile = {};

export function parseVisualProfile(raw: unknown): VisualProfile {
  if (raw == null || (typeof raw === "object" && Object.keys(raw as object).length === 0)) {
    return {};
  }
  const p = visualProfileSchema.safeParse(raw);
  if (!p.success) return {};
  return p.data;
}

export function defaultModesFromProfile(p: VisualProfile): [ModeKey, ModeKey, ModeKey] {
  const d = p.default_modes;
  if (d && d.length === 3) {
    return [d[0]!, d[1]!, d[2]!];
  }
  return [...DEFAULT_MODE_TRIPLE];
}

export function buildProfileHints(p: VisualProfile): string | undefined {
  const parts: string[] = [];
  if (p.caption_style) {
    parts.push(`Longitud de captions en Instagram: ${p.caption_style}`);
  }
  if (p.cta_style) {
    parts.push(`Estilo de llamado a la acción: ${p.cta_style}`);
  }
  if (p.density) {
    parts.push(`Densidad de información en textos: ${p.density}`);
  }
  if (p.typography_scale && p.typography_scale !== 1) {
    parts.push(`Escala tipográfica deseada (relativo): ${p.typography_scale}`);
  }
  return parts.length ? parts.join(". ") : undefined;
}
