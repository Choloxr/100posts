import { isModeKey, type ModeKey, DEFAULT_MODE_TRIPLE } from "@/lib/modes/catalog";

export function parseModeTriple(raw: unknown): [ModeKey, ModeKey, ModeKey] | null {
  if (!Array.isArray(raw) || raw.length !== 3) return null;
  const keys = raw.map((x) => String(x));
  if (!keys.every(isModeKey)) return null;
  if (new Set(keys).size !== 3) return null;
  return [keys[0]!, keys[1]!, keys[2]!];
}

export function parseModeTripleOrDefault(
  raw: unknown,
  fallback: [ModeKey, ModeKey, ModeKey]
): [ModeKey, ModeKey, ModeKey] {
  return parseModeTriple(raw) ?? fallback;
}

export function defaultModeTriple(): [ModeKey, ModeKey, ModeKey] {
  return [...DEFAULT_MODE_TRIPLE];
}
