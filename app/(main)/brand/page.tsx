"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BrandTone } from "@/lib/openai/generate-copy";
import { MODE_KEYS, modeLabel, type ModeKey } from "@/lib/modes/catalog";
import {
  parseVisualProfile,
  defaultModesFromProfile,
  type VisualProfile,
} from "@/lib/visual/profile";

const TONES: { value: BrandTone; label: string }[] = [
  { value: "modern", label: "Moderno" },
  { value: "luxury", label: "Premium" },
  { value: "minimalist", label: "Minimal" },
  { value: "bold", label: "Bold" },
  { value: "tech", label: "Tech" },
  { value: "playful", label: "Jugado" },
];

const inputClass =
  "mt-1.5 w-full rounded-input border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition-all duration-fast placeholder:text-[var(--muted2)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]";

const selectClass =
  "mt-1.5 w-full rounded-input border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition-all duration-fast focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]";

function ModeSelect({
  value,
  onChange,
  label,
}: {
  value: ModeKey;
  onChange: (v: ModeKey) => void;
  label: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[var(--fg)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModeKey)}
        className={selectClass}
      >
        {MODE_KEYS.map((k) => (
          <option key={k} value={k}>
            {modeLabel(k)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  const step1Active = step === 1;
  const step1Done = step === 2;
  const step2Active = step === 2;
  return (
    <nav aria-label="Pasos" className="mb-8">
      <ol className="flex items-center gap-2">
        <li className="flex flex-1 flex-col items-center gap-1.5">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-fast ${
              step1Active
                ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-glow-sm"
                : step1Done
                  ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
            }`}
          >
            {step1Done ? "✓" : "1"}
          </span>
          <span className="text-center text-xs font-semibold text-[var(--fg)]">Tu marca</span>
        </li>
        <li className="h-px min-w-[2rem] flex-1 bg-[var(--border)]" aria-hidden />
        <li className="flex flex-1 flex-col items-center gap-1.5">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-fast ${
              step2Active
                ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-glow-sm"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
            }`}
          >
            2
          </span>
          <span className="text-center text-xs font-semibold text-[var(--fg)]">Estilo visual</span>
        </li>
      </ol>
    </nav>
  );
}

export default function BrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [storeName, setStoreName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [secondaryColor, setSecondaryColor] = useState("#6366f1");
  const [tone, setTone] = useState<BrandTone>("modern");
  const [m0, setM0] = useState<ModeKey>("apple_clean");
  const [m1, setM1] = useState<ModeKey>("minimal_tech");
  const [m2, setM2] = useState<ModeKey>("premium_black");
  const [density, setDensity] = useState<"compact" | "airy" | "">("");
  const [ctaStyle, setCtaStyle] = useState<"pill" | "underline" | "boxed" | "">("");
  const [captionStyle, setCaptionStyle] = useState<"short" | "standard" | "long" | "">("");
  const [placement, setPlacement] = useState<"end" | "start" | "center" | "">("");
  const [typeScale, setTypeScale] = useState(1);
  const [textureBoost, setTextureBoost] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setLoading(false);
          router.push("/login");
        }
        return;
      }
      const { data } = await supabase
        .from("brand_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled && data) {
        setStoreName(data.store_name ?? "");
        setPrimaryColor(data.primary_color ?? "#0f172a");
        setSecondaryColor(data.secondary_color ?? "#6366f1");
        setTone((data.tone as BrandTone) ?? "modern");
        const vp = parseVisualProfile(data.visual_profile);
        const dm = defaultModesFromProfile(vp);
        setM0(dm[0]);
        setM1(dm[1]);
        setM2(dm[2]);
        if (vp.density) setDensity(vp.density);
        if (vp.cta_style) setCtaStyle(vp.cta_style);
        if (vp.caption_style) setCaptionStyle(vp.caption_style);
        if (vp.product_placement) setPlacement(vp.product_placement);
        if (vp.typography_scale != null) setTypeScale(vp.typography_scale);
        if (vp.fal_texture_boost != null) setTextureBoost(vp.fal_texture_boost);
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function persistBrand(visual_profile: VisualProfile) {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("brand_settings").upsert(
      {
        user_id: user.id,
        store_name: storeName.trim(),
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        tone,
        visual_profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  function goStep2() {
    if (!storeName.trim()) {
      alert("Agregá el nombre de tu marca para continuar.");
      return;
    }
    setStep(2);
  }

  async function handleOmitStyle() {
    await persistBrand({});
  }

  async function handleSaveFull() {
    if (new Set([m0, m1, m2]).size !== 3) {
      alert("Elegí tres estilos distintos para las variantes por defecto.");
      return;
    }
    const visual_profile: VisualProfile = {
      default_modes: [m0, m1, m2],
      typography_scale: typeScale,
      fal_texture_boost: textureBoost,
    };
    if (density) visual_profile.density = density;
    if (ctaStyle) visual_profile.cta_style = ctaStyle;
    if (captionStyle) visual_profile.caption_style = captionStyle;
    if (placement) visual_profile.product_placement = placement;
    await persistBrand(visual_profile);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-80" />
        <div className="skeleton mt-6 h-96 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="fade-up-enter mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-[var(--fg)]">Tu marca</h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Dos pasos rápidos: quién sos y, si querés, cómo se ven los diseños por defecto.
        </p>
      </div>

      <div className="space-y-6 rounded-card border border-[var(--border)] bg-[var(--surface)] p-6">
        <Stepper step={step} />

        {step === 1 ? (
          <div className="space-y-5">
            <fieldset className="space-y-4">
              <legend className="text-sm font-bold text-[var(--fg)]">Paso 1 — Tu marca</legend>
              <label className="block text-sm font-semibold text-[var(--fg)]">
                Nombre
                <input
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={inputClass}
                  placeholder="Mi Celu Shop"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm font-semibold text-[var(--fg)]">
                  Color primario
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="mt-1.5 h-12 w-full cursor-pointer rounded-input border border-[var(--border)] bg-transparent"
                  />
                </label>
                <label className="block text-sm font-semibold text-[var(--fg)]">
                  Color secundario
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="mt-1.5 h-12 w-full cursor-pointer rounded-input border border-[var(--border)] bg-transparent"
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-[var(--fg)]">
                Tono de voz
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as BrandTone)}
                  className={selectClass}
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
            <button
              type="button"
              onClick={goStep2}
              className="w-full rounded-btn bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--accent-fg)] transition-all duration-fast hover:-translate-y-px hover:shadow-glow"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[var(--fg)]">Paso 2 — Estilo visual (opcional)</h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                Podés saltear esto y configurarlo después. Si guardás acá, estos valores se usan como
                guía en cada generación.
              </p>
            </div>

            <fieldset className="space-y-4">
              <legend className="sr-only">Preferencias visuales</legend>
              <p className="text-xs text-[var(--muted)]">
                Tres estilos por defecto para cada producto nuevo (la IA también puede variar según el
                tipo de post).
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <ModeSelect value={m0} onChange={setM0} label="Estilo por defecto 1" />
                <ModeSelect value={m1} onChange={setM1} label="Estilo por defecto 2" />
                <ModeSelect value={m2} onChange={setM2} label="Estilo por defecto 3" />
              </div>

              <label className="block text-sm font-semibold text-[var(--fg)]">
                Cuánto texto por slide
                <select
                  value={density}
                  onChange={(e) =>
                    setDensity((e.target.value || "") as "" | "compact" | "airy")
                  }
                  className={selectClass}
                >
                  <option value="">Que elija el modo</option>
                  <option value="airy">Poco texto, más aire</option>
                  <option value="compact">Más datos por slide</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-[var(--fg)]">
                Cómo se ve el botón en la imagen
                <select
                  value={ctaStyle}
                  onChange={(e) =>
                    setCtaStyle((e.target.value || "") as "" | "pill" | "underline" | "boxed")
                  }
                  className={selectClass}
                >
                  <option value="">Que elija el modo</option>
                  <option value="pill">Píldora</option>
                  <option value="boxed">Caja</option>
                  <option value="underline">Subrayado</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-[var(--fg)]">
                Dónde aparece el celular en la portada
                <select
                  value={placement}
                  onChange={(e) =>
                    setPlacement((e.target.value || "") as "" | "end" | "start" | "center")
                  }
                  className={selectClass}
                >
                  <option value="">Que elija el modo</option>
                  <option value="end">A la derecha (feed típico)</option>
                  <option value="start">A la izquierda</option>
                  <option value="center">Centro / hero</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-[var(--fg)]">
                Longitud de los textos del post
                <select
                  value={captionStyle}
                  onChange={(e) =>
                    setCaptionStyle((e.target.value || "") as "" | "short" | "standard" | "long")
                  }
                  className={selectClass}
                >
                  <option value="">Equilibrado</option>
                  <option value="short">Corto</option>
                  <option value="standard">Estándar</option>
                  <option value="long">Largo</option>
                </select>
              </label>

              <details className="rounded-card border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--fg)]">
                  Ajustes avanzados
                </summary>
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-semibold text-[var(--fg)]">
                    Tamaño del texto en los diseños ({typeScale.toFixed(2)})
                    <input
                      type="range"
                      min={0.85}
                      max={1.25}
                      step={0.02}
                      value={typeScale}
                      onChange={(e) => setTypeScale(Number(e.target.value))}
                      className="mt-2 w-full accent-[var(--accent)]"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-[var(--fg)]">
                    Qué tan oscuro es el fondo ({textureBoost.toFixed(2)})
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={textureBoost}
                      onChange={(e) => setTextureBoost(Number(e.target.value))}
                      className="mt-2 w-full accent-[var(--accent)]"
                    />
                  </label>
                </div>
              </details>
            </fieldset>

            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={saving}
                className="rounded-btn border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--fg)] transition-all duration-fast hover:bg-[var(--hover-surface)] disabled:opacity-50"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => void handleOmitStyle()}
                disabled={saving}
                className="rounded-btn border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--fg)] transition-all duration-fast hover:bg-[var(--hover-surface)] disabled:opacity-50"
              >
                Omitir
              </button>
              <button
                type="button"
                onClick={() => void handleSaveFull()}
                disabled={saving}
                className="flex-1 rounded-btn bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--accent-fg)] transition-all duration-fast hover:-translate-y-px hover:shadow-glow disabled:opacity-50 sm:min-w-[8rem]"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
