import OpenAI from "openai";
import { z } from "zod";
import {
  MODE_KEYS,
  isModeKey,
  modeLabel,
  type ModeKey,
} from "@/lib/modes/catalog";
import type { PostType } from "@/lib/product/post-type";
import type { BrandTone } from "@/lib/openai/generate-copy";

const MODEL = "gpt-4o-mini";

const modeKeyEnum = z.enum(MODE_KEYS as unknown as [ModeKey, ...ModeKey[]]);

const pickResponseSchema = z.object({
  mode_keys: z.tuple([modeKeyEnum, modeKeyEnum, modeKeyEnum]),
});

/** Deterministic triple when OpenAI fails or returns invalid data. All entries distinct. */
export function fallbackModesForPostType(postType: PostType): [ModeKey, ModeKey, ModeKey] {
  switch (postType) {
    case "sale":
      return ["deal_bold", "marketplace_loud", "apple_clean"];
    case "informative":
      return ["minimal_tech", "apple_clean", "premium_black"];
    case "launch":
      return ["premium_black", "gaming_neon", "apple_clean"];
    case "offer":
      return ["deal_bold", "marketplace_loud", "cyberpunk"];
  }
}

function normalizeTriple(keys: string[]): [ModeKey, ModeKey, ModeKey] | null {
  if (keys.length !== 3) return null;
  if (!keys.every(isModeKey)) return null;
  if (new Set(keys).size !== 3) return null;
  return [keys[0]!, keys[1]!, keys[2]!];
}

export async function pickModesForPostType(input: {
  postType: PostType;
  productName: string;
  specsSnippet?: string | null;
  tone?: BrandTone;
}): Promise<[ModeKey, ModeKey, ModeKey]> {
  const fallback = fallbackModesForPostType(input.postType);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  const catalogLines = MODE_KEYS.map(
    (k) => `- "${k}": ${modeLabel(k)}`
  ).join("\n");

  const system = `Sos director de arte para carruseles Instagram de tiendas de celulares.
Elegí exactamente tres mode_key DISTINTOS del catálogo, ordenados de más a menos protagonista para esta corrida.
Salida SOLO JSON válido: {"mode_keys":["key1","key2","key3"]} sin markdown.
Las tres claves deben ser distintas y estar en esta lista exacta:
${MODE_KEYS.map((k) => `"${k}"`).join(", ")}`;

  const typeGuide: Record<PostType, string> = {
    sale: "Venta: empujar compra, confianza, precio claro; mezclá estilos que conviertan.",
    informative:
      "Informativo: specs claros, sensación premium o tech datasheet, sin gritar promo.",
    launch:
      "Lanzamiento: novedad, hype contenido, sensación evento o flagship.",
    offer:
      "Oferta: urgencia, promo, contraste alto; al menos un modo muy comercial.",
  };

  const user = `Tipo de post: ${input.postType} (${typeGuide[input.postType]})
Producto: ${input.productName}
${input.specsSnippet?.trim() ? `Notas breves: ${input.specsSnippet.trim().slice(0, 400)}` : ""}
${input.tone ? `Tono de marca: ${input.tone}` : ""}

Catálogo (referencia):
${catalogLines}

Devolvé JSON: {"mode_keys":["...","...","..."]}`;

  try {
    const openai = new OpenAI({ apiKey });
    const res = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.45,
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) return fallback;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return fallback;
    }

    const loose = parsed as { mode_keys?: unknown };
    const arr = Array.isArray(loose.mode_keys)
      ? loose.mode_keys.map((x) => String(x))
      : null;
    const normalized = arr ? normalizeTriple(arr) : null;
    if (normalized) return normalized;

    const validated = pickResponseSchema.safeParse(parsed);
    if (validated.success) {
      const t = validated.data.mode_keys;
      if (new Set(t).size === 3) return t;
    }
  } catch {
    // fall through
  }

  return fallback;
}
