import type { ModeKey } from "@/lib/modes/catalog";

type DisplayFontSpec = {
  family: string;
  weight: 400 | 600 | 700 | 800;
  /** unpkg @fontsource path */
  url: string;
};

const DISPLAY_BY_MODE: Record<ModeKey, DisplayFontSpec> = {
  apple_clean: {
    family: "Lexend",
    weight: 700,
    url: "https://unpkg.com/@fontsource/lexend@5.0.20/files/lexend-latin-700-normal.woff",
  },
  minimal_tech: {
    family: "IBM Plex Sans",
    weight: 600,
    url: "https://unpkg.com/@fontsource/ibm-plex-sans@5.0.21/files/ibm-plex-sans-latin-600-normal.woff",
  },
  premium_black: {
    family: "Outfit",
    weight: 600,
    url: "https://unpkg.com/@fontsource/outfit@5.0.14/files/outfit-latin-600-normal.woff",
  },
  gaming_neon: {
    family: "Plus Jakarta Sans",
    weight: 800,
    url: "https://unpkg.com/@fontsource/plus-jakarta-sans@5.0.21/files/plus-jakarta-sans-latin-800-normal.woff",
  },
  deal_bold: {
    family: "Archivo Black",
    weight: 400,
    url: "https://unpkg.com/@fontsource/archivo-black@5.0.20/files/archivo-black-latin-400-normal.woff",
  },
  cyberpunk: {
    family: "Exo 2",
    weight: 700,
    url: "https://unpkg.com/@fontsource/exo-2@5.0.20/files/exo-2-latin-700-normal.woff",
  },
  marketplace_loud: {
    family: "Rubik",
    weight: 700,
    url: "https://unpkg.com/@fontsource/rubik@5.0.22/files/rubik-latin-700-normal.woff",
  },
};

const displayCache = new Map<ModeKey, ArrayBuffer>();

async function loadDisplayBuffer(mode: ModeKey): Promise<ArrayBuffer> {
  const hit = displayCache.get(mode);
  if (hit) return hit;
  const spec = DISPLAY_BY_MODE[mode];
  const res = await fetch(spec.url);
  if (!res.ok) throw new Error(`Display font fetch failed for ${mode}`);
  const buf = await res.arrayBuffer();
  displayCache.set(mode, buf);
  return buf;
}

export type SatoriFont = {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal";
};

export async function getDisplayFontForMode(mode: ModeKey): Promise<{
  fonts: SatoriFont[];
  displayFamily: string;
}> {
  const spec = DISPLAY_BY_MODE[mode];
  const data = await loadDisplayBuffer(mode);
  return {
    displayFamily: spec.family,
    fonts: [
      {
        name: spec.family,
        data,
        weight: spec.weight,
        style: "normal" as const,
      },
    ],
  };
}
