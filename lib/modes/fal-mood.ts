import type { ModeKey } from "@/lib/modes/catalog";

/** Prompt fragment for fal (texture only, no text). */
export function describeModeForFal(key: ModeKey): string {
  switch (key) {
    case "apple_clean":
      return "ultra clean soft gradient, apple keynote aesthetic, porcelain and fog, subtle vignette, premium product photography backdrop, soft daylight, almost monochrome with one accent hue";
    case "minimal_tech":
      return "swiss grid subtle lines, cool grey studio, precision engineering mood, soft reflections, diagonal light streak, high-end gadget catalog";
    case "premium_black":
      return "deep matte black with soft rim light, velvet darkness, gold or silver micro-accents in bokeh, luxury watch campaign mood, cinematic shallow depth";
    case "gaming_neon":
      return "rgb edge lighting traces, dark arena, holographic highlights, esports energy, subtle scanlines, no logos";
    case "deal_bold":
      return "high voltage retail, spotlight cones, confetti dust bokeh, saturday sale floor energy, bold color blocks, still no text";
    case "cyberpunk":
      return "magenta cyan volumetric haze, wet asphalt reflections, neon tubes far in blur, blade runner dusk, gritty but polished";
    case "marketplace_loud":
      return "busy marketplace energy, yellow confidence highlights, corrugated light patterns, trusted seller vibe, warm busy bokeh, no text";
    default:
      return "premium abstract retail background";
  }
}
