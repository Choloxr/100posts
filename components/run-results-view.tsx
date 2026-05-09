"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/copy-button";

export type RunVariantVm = {
  variantIndex: number;
  /** Human-readable style name (e.g. Apple-style) */
  modeLabel: string;
  caption: string;
  cta: string;
  slideUrls: string[];
};

function extractHashtagTags(text: string): string[] {
  const matches = text.match(/#[\w\u00c0-\u024f]+/gi);
  if (!matches) return [];
  return [...new Set(matches)];
}

export function RunResultsView({
  runId,
  productName,
  postTypeLabel,
  variants,
}: {
  runId: string;
  productName: string;
  postTypeLabel: string | null;
  variants: RunVariantVm[];
}) {
  const [activeVariant, setActiveVariant] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  const v = variants[activeVariant];
  const slides = useMemo(() => v?.slideUrls.filter(Boolean) ?? [], [v]);

  const tags = useMemo(() => extractHashtagTags(v?.caption ?? ""), [v?.caption]);

  const touchStartX = useRef<number | null>(null);

  const variantIndex = variants[activeVariant]?.variantIndex ?? activeVariant;

  const goSlide = useCallback(
    (dir: -1 | 1) => {
      if (!slides.length) return;
      setSlideIndex((i) => {
        const n = slides.length;
        return (i + dir + n) % n;
      });
    },
    [slides.length]
  );

  const safeSlideIdx = slides.length ? Math.min(slideIndex, slides.length - 1) : 0;

  const onVariantTab = useCallback((idx: number) => {
    setActiveVariant(idx);
    setSlideIndex(0);
  }, []);

  const shareLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareCopied(false);
    }
  };

  const copyTag = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
    } catch {
      /* noop */
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    if (start === null || !slides.length) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (dx > 50) goSlide(-1);
    else if (dx < -50) goSlide(1);
    touchStartX.current = null;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden pb-16">
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,rgba(124,92,252,0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(139,92,246,0.06),transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-2 sm:px-4 lg:gap-12">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="text-xs font-medium text-[var(--muted)] transition-colors duration-fast hover:text-[var(--fg)]"
              >
                ← Inicio
              </Link>
            </div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[var(--fg)]">
              {productName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {postTypeLabel ? (
                <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-1 text-xs font-semibold text-[var(--fg)]">
                  {postTypeLabel}
                </span>
              ) : (
                <span className="text-xs text-[var(--muted)]">Corrida lista</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products/new"
                className="inline-flex flex-1 items-center justify-center rounded-btn bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] shadow-glow-sm transition-all duration-fast hover:-translate-y-px hover:shadow-glow sm:flex-initial"
              >
                Generar de nuevo
              </Link>
              <button
                type="button"
                onClick={() => void shareLink()}
                className="rounded-btn border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--fg)] transition-all duration-fast hover:bg-[var(--hover-surface)]"
              >
                {shareCopied ? "¡Link copiado!" : "Compartir"}
              </button>
            </div>
            <a
              href={`/api/runs/${runId}/zip`}
              className="inline-flex w-full items-center justify-center rounded-btn border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition-all duration-fast hover:bg-[var(--accent)]/20 sm:w-auto sm:self-end"
            >
              Descargar todo (ZIP)
            </a>
          </div>
        </header>

        {/* Variant tabs */}
        <div role="tablist" className="-mx-1 flex gap-1.5 overflow-x-auto pb-2 sm:mx-0 sm:justify-center">
          {variants.map((variant, idx) => {
            const active = idx === activeVariant;
            return (
              <button
                key={variant.variantIndex}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => onVariantTab(idx)}
                className={`shrink-0 rounded-btn px-5 py-2.5 text-sm font-semibold transition-all duration-fast ${
                  active
                    ? "bg-[var(--accent)]/15 text-[var(--accent)] shadow-glow-sm ring-2 ring-[var(--accent)]/60"
                    : "border border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--muted-bg)] hover:text-[var(--fg)]"
                }`}
              >
                Variante {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Main variant panel */}
        {v ? (
          <div key={activeVariant} className="run-variant-pane">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:gap-14 lg:items-start">
              {/* Carousel + badges + actions */}
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--fg)]">
                    {v.modeLabel}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/api/runs/${runId}/zip?variant=${variantIndex}`}
                      className="inline-flex items-center rounded-btn bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] shadow-glow-sm transition-all duration-fast hover:-translate-y-px hover:shadow-glow"
                    >
                      Descargar ZIP
                    </a>
                  </div>
                </div>

                <div
                  className="relative mx-auto w-full max-w-md overflow-hidden rounded-card border border-[var(--border)] bg-[var(--surface)] shadow-card lg:max-w-lg"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-white/[0.02] to-transparent">
                    {slides[safeSlideIdx] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slides[safeSlideIdx]}
                        alt={`Slide ${safeSlideIdx + 1}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                        Sin vistas previas
                      </div>
                    )}
                  </div>
                  {slides.length > 1 ? (
                    <>
                      <button
                        type="button"
                        aria-label="Slide anterior"
                        onClick={() => goSlide(-1)}
                        className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)]/80 text-[var(--fg)] backdrop-blur-md transition-all duration-fast hover:bg-[var(--surface)]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Slide siguiente"
                        onClick={() => goSlide(1)}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)]/80 text-[var(--fg)] backdrop-blur-md transition-all duration-fast hover:bg-[var(--surface)]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-[var(--bg)]/70 px-2 py-1.5 backdrop-blur">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Ir al slide ${i + 1}`}
                            aria-current={i === safeSlideIdx}
                            onClick={() => setSlideIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-fast ${
                              i === safeSlideIdx ? "w-5 bg-[var(--accent)]" : "w-1.5 bg-white/35 hover:bg-white/55"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Caption + CTA + hashtags */}
              <div className="flex flex-col gap-6 rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card sm:p-6">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Caption
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--fg)]">
                    {v.caption}
                  </p>
                  <div className="mt-4">
                    <CopyButton text={v.caption} label="Copiar caption completo" />
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

                <div className="rounded-btn border border-[var(--accent)]/20 bg-[var(--accent)]/[0.07] px-4 py-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                    CTA
                  </h2>
                  <p className="mt-2 text-base font-semibold text-[var(--fg)]">{v.cta}</p>
                  <div className="mt-4">
                    <CopyButton text={v.cta} label="Copiar CTA" />
                  </div>
                </div>

                {tags.length > 0 ? (
                  <>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                        Hashtags
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => void copyTag(tag)}
                            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] transition-all duration-fast hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Tap para copiar cada hashtag.
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
