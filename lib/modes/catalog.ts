export const MODE_KEYS = [
  "apple_clean",
  "minimal_tech",
  "premium_black",
  "gaming_neon",
  "deal_bold",
  "cyberpunk",
  "marketplace_loud",
] as const;

export type ModeKey = (typeof MODE_KEYS)[number];

export const DEFAULT_MODE_TRIPLE: [ModeKey, ModeKey, ModeKey] = [
  "apple_clean",
  "minimal_tech",
  "premium_black",
];

export const MODE_KEY_ENUM = MODE_KEYS;

export function isModeKey(s: string): s is ModeKey {
  return (MODE_KEYS as readonly string[]).includes(s);
}

export function modeLabel(key: ModeKey): string {
  switch (key) {
    case "apple_clean":
      return "Apple-style";
    case "minimal_tech":
      return "Minimal tech";
    case "premium_black":
      return "Premium black";
    case "gaming_neon":
      return "Gaming";
    case "deal_bold":
      return "Oferta agresiva";
    case "cyberpunk":
      return "Cyberpunk";
    case "marketplace_loud":
      return "MercadoLibre vibe";
    default:
      return key;
  }
}

/** Breve guía de copy por modo (OpenAI). */
export function modeCopyBrief(key: ModeKey): string {
  switch (key) {
    case "apple_clean":
      return "Minimal, aspiracional, pocas palabras, sensación keynote.";
    case "minimal_tech":
      return "Frío, preciso, specs como datasheet premium.";
    case "premium_black":
      return "Lujo silencioso, exclusividad, sin gritar precio.";
    case "gaming_neon":
      return "Energía, FPS/RAM/refresh, público gamer.";
    case "deal_bold":
      return "Urgencia, promo, precio protagonista, imperativo.";
    case "cyberpunk":
      return "Futurista, glitch-light, tech underground.";
    case "marketplace_loud":
      return "Directo, confianza ML, envío/garantía, bullets claros.";
    default:
      return "";
  }
}
