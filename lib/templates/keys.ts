/**
 * Re-exporta el catálogo de modos por compatibilidad con imports viejos.
 */
export {
  MODE_KEYS,
  type ModeKey,
  DEFAULT_MODE_TRIPLE,
  modeLabel,
  modeLabel as templateLabel,
  MODE_KEY_ENUM,
} from "@/lib/modes/catalog";

export type TemplateKey = import("@/lib/modes/catalog").ModeKey;

import type { ModeKey } from "@/lib/modes/catalog";
import { DEFAULT_MODE_TRIPLE } from "@/lib/modes/catalog";

/** @deprecated usar DEFAULT_MODE_TRIPLE */
export const TEMPLATE_ORDER: ModeKey[] = [...DEFAULT_MODE_TRIPLE];
