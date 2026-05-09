import type { ModeKey } from "@/lib/modes/catalog";
import type { VisualProfile } from "@/lib/visual/profile";

export type CtaStyle = "pill" | "underline" | "boxed";

export type VisualTokens = {
  padding: number;
  overlayOpacity: number;
  coverHeadline: number;
  coverSub: number;
  storeLabel: number;
  storeTracking: number;
  specsTitle: number;
  specsBullet: number;
  specsGap: number;
  priceLabel: number;
  priceMain: number;
  priceSub: number;
  priceThumbW: number;
  priceThumbH: number;
  ctaTitle: number;
  ctaSub: number;
  ctaPillRadius: number;
  ctaPillPadY: number;
  ctaPillPadX: number;
  productCoverW: number;
  productCoverH: number;
  /** Cover layout: product right (default IG), left, or stacked */
  coverProductSide: "end" | "start" | "center";
  bulletStyle: "dot" | "dash" | "square";
  headlineWeight: 700 | 800;
  ctaStyle: CtaStyle;
};

const base = (partial: Partial<VisualTokens>): VisualTokens => ({
  padding: 48,
  overlayOpacity: 0.78,
  coverHeadline: 56,
  coverSub: 28,
  storeLabel: 20,
  storeTracking: 2,
  specsTitle: 40,
  specsBullet: 30,
  specsGap: 18,
  priceLabel: 40,
  priceMain: 86,
  priceSub: 28,
  priceThumbW: 280,
  priceThumbH: 340,
  ctaTitle: 48,
  ctaSub: 30,
  ctaPillRadius: 14,
  ctaPillPadY: 20,
  ctaPillPadX: 32,
  productCoverW: 440,
  productCoverH: 540,
  coverProductSide: "end",
  bulletStyle: "dot",
  headlineWeight: 700,
  ctaStyle: "pill",
  ...partial,
});

export function getBaseTokensForMode(mode: ModeKey): VisualTokens {
  switch (mode) {
    case "apple_clean":
      return base({
        padding: 56,
        overlayOpacity: 0.55,
        coverHeadline: 52,
        coverSub: 26,
        storeLabel: 18,
        storeTracking: 4,
        specsTitle: 36,
        specsBullet: 26,
        specsGap: 22,
        priceMain: 78,
        priceSub: 26,
        ctaTitle: 44,
        ctaSub: 28,
        ctaPillRadius: 999,
        productCoverW: 400,
        productCoverH: 520,
        coverProductSide: "end",
        bulletStyle: "dash",
        headlineWeight: 700,
        ctaStyle: "pill",
      });
    case "minimal_tech":
      return base({
        padding: 44,
        overlayOpacity: 0.72,
        coverHeadline: 54,
        coverSub: 27,
        specsTitle: 38,
        specsBullet: 28,
        specsGap: 16,
        priceMain: 82,
        ctaTitle: 46,
        ctaPillRadius: 8,
        productCoverW: 420,
        productCoverH: 520,
        coverProductSide: "start",
        bulletStyle: "square",
        ctaStyle: "boxed",
      });
    case "premium_black":
      return base({
        padding: 52,
        overlayOpacity: 0.88,
        coverHeadline: 50,
        coverSub: 24,
        storeLabel: 16,
        storeTracking: 6,
        specsTitle: 34,
        specsBullet: 26,
        priceMain: 72,
        priceSub: 24,
        ctaTitle: 40,
        ctaSub: 26,
        ctaPillRadius: 4,
        productCoverW: 380,
        productCoverH: 500,
        coverProductSide: "center",
        bulletStyle: "dot",
        ctaStyle: "underline",
      });
    case "gaming_neon":
      return base({
        padding: 40,
        overlayOpacity: 0.68,
        coverHeadline: 58,
        coverSub: 30,
        storeLabel: 22,
        specsTitle: 42,
        specsBullet: 32,
        specsGap: 14,
        priceMain: 92,
        priceSub: 30,
        ctaTitle: 52,
        ctaSub: 32,
        ctaPillRadius: 6,
        productCoverW: 460,
        productCoverH: 560,
        coverProductSide: "end",
        bulletStyle: "square",
        headlineWeight: 800,
        ctaStyle: "boxed",
      });
    case "deal_bold":
      return base({
        padding: 36,
        overlayOpacity: 0.62,
        coverHeadline: 62,
        coverSub: 32,
        storeLabel: 24,
        priceLabel: 48,
        priceMain: 102,
        priceSub: 30,
        ctaTitle: 54,
        ctaSub: 32,
        ctaPillRadius: 10,
        productCoverW: 400,
        productCoverH: 480,
        coverProductSide: "end",
        headlineWeight: 800,
        ctaStyle: "pill",
      });
    case "cyberpunk":
      return base({
        padding: 42,
        overlayOpacity: 0.7,
        coverHeadline: 56,
        coverSub: 28,
        specsBullet: 28,
        priceMain: 88,
        ctaTitle: 50,
        ctaSub: 28,
        ctaPillRadius: 4,
        productCoverW: 440,
        productCoverH: 540,
        coverProductSide: "start",
        bulletStyle: "dash",
        headlineWeight: 800,
        ctaStyle: "boxed",
      });
    case "marketplace_loud":
      return base({
        padding: 32,
        overlayOpacity: 0.58,
        coverHeadline: 48,
        coverSub: 30,
        storeLabel: 22,
        specsTitle: 44,
        specsBullet: 30,
        specsGap: 12,
        priceMain: 96,
        priceSub: 30,
        ctaTitle: 46,
        ctaSub: 30,
        ctaPillRadius: 12,
        productCoverW: 420,
        productCoverH: 500,
        coverProductSide: "end",
        bulletStyle: "dot",
        ctaStyle: "pill",
      });
    default:
      return base({});
  }
}

export function mergeTokensWithProfile(
  mode: ModeKey,
  profile: VisualProfile
): VisualTokens {
  let t = getBaseTokensForMode(mode);
  const scale = profile.typography_scale ?? 1;
  if (scale !== 1) {
    t = {
      ...t,
      coverHeadline: Math.round(t.coverHeadline * scale),
      coverSub: Math.round(t.coverSub * scale),
      specsTitle: Math.round(t.specsTitle * scale),
      specsBullet: Math.round(t.specsBullet * scale),
      priceMain: Math.round(t.priceMain * scale),
      priceSub: Math.round(t.priceSub * scale),
      ctaTitle: Math.round(t.ctaTitle * scale),
      ctaSub: Math.round(t.ctaSub * scale),
    };
  }
  if (profile.density === "airy") {
    t = { ...t, padding: t.padding + 16, specsGap: t.specsGap + 8 };
  }
  if (profile.density === "compact") {
    t = { ...t, padding: Math.max(28, t.padding - 12), specsGap: Math.max(10, t.specsGap - 4) };
  }
  if (profile.cta_style) {
    t = { ...t, ctaStyle: profile.cta_style };
  }
  if (profile.product_placement) {
    t = { ...t, coverProductSide: profile.product_placement };
  }
  const boost = profile.fal_texture_boost ?? 0;
  if (boost > 0) {
    t = { ...t, overlayOpacity: Math.min(0.92, t.overlayOpacity + boost * 0.08) };
  }
  return t;
}
