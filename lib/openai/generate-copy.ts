import OpenAI from "openai";
import { copyBatchSchema, type CopyBatch } from "@/lib/templates/copy-schema";
import type { ModeKey } from "@/lib/modes/catalog";
import { modeCopyBrief } from "@/lib/modes/catalog";

const MODEL = "gpt-4o-mini";

export type BrandTone =
  | "modern"
  | "luxury"
  | "minimalist"
  | "bold"
  | "tech"
  | "playful";

export async function generateCopyBatch(input: {
  storeName: string;
  tone: BrandTone;
  productName: string;
  price: string;
  specs: string;
  modeOrder: [ModeKey, ModeKey, ModeKey];
  profileHints?: string;
}): Promise<CopyBatch> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });

  const [m0, m1, m2] = input.modeOrder;
  const modeGuide = input.modeOrder
    .map((m) => `- ${m}: ${modeCopyBrief(m)}`)
    .join("\n");

  const system = `Sos copywriter para Instagram de TIENDAS DE CELULARES en español (Latam).
Reglas:
- Salida SOLO JSON válido, sin markdown.
- Exactamente tres objetos en "variants", en este orden de mode_key: "${m0}", luego "${m1}", luego "${m2}".
- Cada variante debe tener mode_key exactamente una de esas tres cadenas (en el orden anterior).
- Tono de marca global: ${input.tone}.
- Nombre de tienda: ${input.storeName}.
- Guía por modo (adaptá el copy a cada estilo):
${modeGuide}
- specs_bullets: 3 a 5 strings cortos (pantalla, RAM, batería, cámara, etc.) basados en los specs del usuario; si faltan datos, inferí bullets plausibles.
- instagram_caption: listo para pegar; hook en la primera línea; hashtags máximo 3 al final si suman.
- instagram_cta: una línea accionable (DM, WhatsApp, "Reservá hoy").
${input.profileHints ? `\nPreferencias visuales / voz de la cuenta:\n${input.profileHints}\n` : ""}`;

  const user = `Producto: ${input.productName}
Precio (texto exacto que mostrar en slide): ${input.price}
Specs / notas del vendedor:
${input.specs || "(sin specs, inferí bullets plausibles)"}

JSON shape exacto (mode_key en orden ${m0}, ${m1}, ${m2}):
{
  "variants": [
    {
      "mode_key": "${m0}",
      "cover_headline": "",
      "cover_sub": "",
      "specs_title": "",
      "specs_bullets": ["","",""],
      "price_main": "",
      "price_sub": "",
      "cta_title": "",
      "cta_sub": "",
      "instagram_caption": "",
      "instagram_cta": ""
    },
    {
      "mode_key": "${m1}",
      ...
    },
    {
      "mode_key": "${m2}",
      ...
    }
  ]
}`;

  const res = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned empty content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  const validated = copyBatchSchema.safeParse(parsed);
  if (!validated.success) {
    const repair = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
        { role: "assistant", content: raw },
        {
          role: "user",
          content: `Corregí el JSON para cumplir el schema. Errores: ${validated.error.message}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    const raw2 = repair.choices[0]?.message?.content;
    if (!raw2) throw new Error("OpenAI repair returned empty");
    const parsed2 = JSON.parse(raw2) as unknown;
    const v2 = copyBatchSchema.safeParse(parsed2);
    if (!v2.success) {
      throw new Error(`Copy validation failed: ${v2.error.message}`);
    }
    return v2.data;
  }

  return validated.data;
}
