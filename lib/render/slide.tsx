import React from "react";
import satori from "satori";
import sharp from "sharp";
import type { VariantCopy } from "@/lib/templates/copy-schema";
import { loadInterFonts } from "@/lib/render/fonts";
import { getDisplayFontForMode } from "@/lib/render/font-display";
import type { VisualTokens } from "@/lib/modes/tokens";
import type { ModeKey } from "@/lib/modes/catalog";

export const IG_WIDTH = 1080;
export const IG_HEIGHT = 1350;

export type SlideIndex = 0 | 1 | 2 | 3;

function Root({
  children,
  textureSrc,
  primaryColor,
  overlayOpacity,
}: {
  children: React.ReactNode;
  textureSrc: string;
  primaryColor: string;
  overlayOpacity: number;
}) {
  return (
    <div
      style={{
        width: IG_WIDTH,
        height: IG_HEIGHT,
        position: "relative",
        display: "flex",
        background: "#030712",
      }}
    >
      <img
        src={textureSrc}
        width={IG_WIDTH}
        height={IG_HEIGHT}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: IG_WIDTH,
          height: IG_HEIGHT,
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: IG_WIDTH,
          height: IG_HEIGHT,
          backgroundColor: primaryColor,
          opacity: overlayOpacity,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          width: IG_WIDTH,
          height: IG_HEIGHT,
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function BulletMark({
  secondaryColor,
  style,
}: {
  secondaryColor: string;
  style: "dot" | "dash" | "square";
}) {
  if (style === "dash") {
    return (
      <div
        style={{
          width: 28,
          height: 4,
          backgroundColor: secondaryColor,
          marginTop: 14,
          flexShrink: 0,
          borderRadius: 2,
        }}
      />
    );
  }
  if (style === "square") {
    return (
      <div
        style={{
          width: 14,
          height: 14,
          backgroundColor: secondaryColor,
          marginTop: 10,
          flexShrink: 0,
          borderRadius: 2,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: 999,
        backgroundColor: secondaryColor,
        marginTop: 10,
        flexShrink: 0,
      }}
    />
  );
}

function SlideCover({
  copy,
  productSrc,
  storeName,
  secondaryColor,
  tokens,
  displayFamily,
}: {
  copy: VariantCopy;
  productSrc: string | null;
  storeName: string;
  secondaryColor: string;
  tokens: VisualTokens;
  displayFamily: string;
}) {
  const side = tokens.coverProductSide;
  const textBlock = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: side === "center" ? 0 : 1,
        minWidth: 0,
        maxWidth: side === "center" ? 920 : productSrc ? 520 : 900,
        alignItems: side === "center" ? "center" : "flex-start",
        textAlign: side === "center" ? "center" : "left",
      }}
    >
      <div
        style={{
          fontSize: tokens.storeLabel,
          fontFamily: "Inter",
          fontWeight: 700,
          color: secondaryColor,
          letterSpacing: tokens.storeTracking,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        {storeName}
      </div>
      <div
        style={{
          fontSize: tokens.coverHeadline,
          fontFamily: displayFamily,
          fontWeight: tokens.headlineWeight,
          color: "#ffffff",
          lineHeight: 1.04,
        }}
      >
        {copy.cover_headline}
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: tokens.coverSub,
          fontFamily: "Inter",
          fontWeight: 400,
          color: "#e2e8f0",
          lineHeight: 1.38,
        }}
      >
        {copy.cover_sub}
      </div>
    </div>
  );

  const productBlock =
    productSrc && side !== "center" ? (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "flex-end",
          justifyContent: side === "start" ? "flex-start" : "flex-end",
          minWidth: 0,
        }}
      >
        <img
          src={productSrc}
          width={tokens.productCoverW}
          height={tokens.productCoverH}
          style={{
            objectFit: "contain",
            filter: "drop-shadow(0 28px 56px rgba(0,0,0,0.5))",
          }}
        />
      </div>
    ) : null;

  const productCenter =
    productSrc && side === "center" ? (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 28,
        }}
      >
        <img
          src={productSrc}
          width={tokens.productCoverW}
          height={tokens.productCoverH}
          style={{
            objectFit: "contain",
            filter: "drop-shadow(0 28px 56px rgba(0,0,0,0.5))",
          }}
        />
      </div>
    ) : null;

  if (side === "center") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: tokens.padding,
        }}
      >
        {textBlock}
        {productCenter}
        {!productSrc ? <div style={{ flex: 1 }} /> : null}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        padding: tokens.padding,
        gap: 24,
        alignItems: "stretch",
      }}
    >
      {side === "start" ? (
        <>
          {productBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {productBlock}
        </>
      )}
    </div>
  );
}

function SlideSpecs({
  copy,
  secondaryColor,
  tokens,
  displayFamily,
}: {
  copy: VariantCopy;
  secondaryColor: string;
  tokens: VisualTokens;
  displayFamily: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: tokens.padding,
      }}
    >
      <div
        style={{
          fontSize: tokens.specsTitle,
          fontFamily: displayFamily,
          fontWeight: tokens.headlineWeight,
          color: "#ffffff",
          marginBottom: 26,
          letterSpacing: -0.5,
        }}
      >
        {copy.specs_title}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.specsGap,
        }}
      >
        {copy.specs_bullets.map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <BulletMark secondaryColor={secondaryColor} style={tokens.bulletStyle} />
            <div
              style={{
                fontSize: tokens.specsBullet,
                fontFamily: "Inter",
                fontWeight: 400,
                color: "#f1f5f9",
                lineHeight: 1.36,
                flex: 1,
              }}
            >
              {line}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidePrice({
  copy,
  productSrc,
  secondaryColor,
  tokens,
  displayFamily,
}: {
  copy: VariantCopy;
  productSrc: string | null;
  secondaryColor: string;
  tokens: VisualTokens;
  displayFamily: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: tokens.padding,
      }}
    >
      {productSrc ? (
        <img
          src={productSrc}
          width={tokens.priceThumbW}
          height={tokens.priceThumbH}
          style={{
            objectFit: "contain",
            marginBottom: 28,
            opacity: 0.96,
          }}
        />
      ) : null}
      <div
        style={{
          fontSize: tokens.priceLabel,
          fontFamily: displayFamily,
          fontWeight: 700,
          color: secondaryColor,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Precio
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: tokens.priceMain,
          fontFamily: displayFamily,
          fontWeight: tokens.headlineWeight,
          color: "#ffffff",
          lineHeight: 1,
        }}
      >
        {copy.price_main}
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: tokens.priceSub,
          fontFamily: "Inter",
          fontWeight: 400,
          color: "#cbd5e1",
          maxWidth: 880,
          lineHeight: 1.42,
        }}
      >
        {copy.price_sub}
      </div>
    </div>
  );
}

function SlideCta({
  copy,
  storeName,
  secondaryColor,
  tokens,
  displayFamily,
}: {
  copy: VariantCopy;
  storeName: string;
  secondaryColor: string;
  tokens: VisualTokens;
  displayFamily: string;
}) {
  const pill = tokens.ctaStyle === "pill";
  const boxed = tokens.ctaStyle === "boxed";
  const underline = tokens.ctaStyle === "underline";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        padding: tokens.padding,
      }}
    >
      <div
        style={{
          fontSize: tokens.ctaTitle,
          fontFamily: displayFamily,
          fontWeight: tokens.headlineWeight,
          color: "#ffffff",
          lineHeight: 1.12,
        }}
      >
        {copy.cta_title}
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: tokens.ctaSub,
          fontFamily: "Inter",
          fontWeight: 400,
          color: "#e2e8f0",
          lineHeight: 1.42,
        }}
      >
        {copy.cta_sub}
      </div>
      {pill ? (
        <div
          style={{
            marginTop: 44,
            padding: `${tokens.ctaPillPadY}px ${tokens.ctaPillPadX}px`,
            borderRadius: tokens.ctaPillRadius,
            backgroundColor: secondaryColor,
            alignSelf: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontFamily: "Inter",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {storeName}
          </span>
        </div>
      ) : null}
      {boxed ? (
        <div
          style={{
            marginTop: 44,
            padding: `${tokens.ctaPillPadY}px ${tokens.ctaPillPadX}px`,
            borderRadius: tokens.ctaPillRadius,
            border: `3px solid ${secondaryColor}`,
            alignSelf: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontFamily: displayFamily,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {storeName}
          </span>
        </div>
      ) : null}
      {underline ? (
        <div
          style={{
            marginTop: 48,
            alignSelf: "flex-start",
            borderBottom: `4px solid ${secondaryColor}`,
            paddingBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontFamily: displayFamily,
              fontWeight: 700,
              color: "#f8fafc",
              letterSpacing: 1,
            }}
          >
            {storeName}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function buildTree(
  slide: SlideIndex,
  copy: VariantCopy,
  textureSrc: string,
  productSrc: string | null,
  storeName: string,
  primaryColor: string,
  secondaryColor: string,
  tokens: VisualTokens,
  displayFamily: string
): React.ReactNode {
  let inner: React.ReactNode;
  switch (slide) {
    case 0:
      inner = (
        <SlideCover
          copy={copy}
          productSrc={productSrc}
          storeName={storeName}
          secondaryColor={secondaryColor}
          tokens={tokens}
          displayFamily={displayFamily}
        />
      );
      break;
    case 1:
      inner = (
        <SlideSpecs
          copy={copy}
          secondaryColor={secondaryColor}
          tokens={tokens}
          displayFamily={displayFamily}
        />
      );
      break;
    case 2:
      inner = (
        <SlidePrice
          copy={copy}
          productSrc={productSrc}
          secondaryColor={secondaryColor}
          tokens={tokens}
          displayFamily={displayFamily}
        />
      );
      break;
    case 3:
      inner = (
        <SlideCta
          copy={copy}
          storeName={storeName}
          secondaryColor={secondaryColor}
          tokens={tokens}
          displayFamily={displayFamily}
        />
      );
      break;
    default:
      inner = null;
  }

  return (
    <Root
      textureSrc={textureSrc}
      primaryColor={primaryColor}
      overlayOpacity={tokens.overlayOpacity}
    >
      {inner}
    </Root>
  );
}

export async function renderSlidePng(input: {
  slide: SlideIndex;
  copy: VariantCopy;
  textureJpeg: Buffer;
  productPng: Buffer | null;
  storeName: string;
  primaryColor: string;
  secondaryColor: string;
  modeKey: ModeKey;
  tokens: VisualTokens;
}): Promise<Buffer> {
  const inter = await loadInterFonts();
  const { fonts: displayFonts, displayFamily } = await getDisplayFontForMode(input.modeKey);
  const fonts = [...inter, ...displayFonts];

  const textureSrc = `data:image/jpeg;base64,${input.textureJpeg.toString("base64")}`;
  const productSrc = input.productPng
    ? `data:image/png;base64,${input.productPng.toString("base64")}`
    : null;

  const element = buildTree(
    input.slide,
    input.copy,
    textureSrc,
    productSrc,
    input.storeName,
    input.primaryColor,
    input.secondaryColor,
    input.tokens,
    displayFamily
  );

  const svg = await satori(element as React.ReactElement, {
    width: IG_WIDTH,
    height: IG_HEIGHT,
    fonts,
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}
