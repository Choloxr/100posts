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
    <label className="block text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModeKey)}
        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
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

export default function BrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        router.push("/login");
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (new Set([m0, m1, m2]).size !== 3) {
      alert("Elegí tres modos distintos para las variantes por defecto.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
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

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Cargando…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Tu marca</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Identidad, look recurrente y modos por defecto para cada corrida.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[var(--fg)]">Identidad</legend>
          <label className="block text-sm font-medium">
            Nombre de la tienda
            <input
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Mi Celu Shop"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              Color primario
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded border border-[var(--border)]"
              />
            </label>
            <label className="block text-sm font-medium">
              Color secundario
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded border border-[var(--border)]"
              />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Tono de voz (copy)
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as BrandTone)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset className="space-y-3 border-t border-[var(--border)] pt-4">
          <legend className="text-sm font-semibold text-[var(--fg)]">Look de la cuenta</legend>
          <p className="text-xs text-[var(--muted)]">
            Tres modos por defecto cuando generás un producto (podés cambiarlos en cada corrida).
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ModeSelect value={m0} onChange={setM0} label="Variante 1" />
            <ModeSelect value={m1} onChange={setM1} label="Variante 2" />
            <ModeSelect value={m2} onChange={setM2} label="Variante 3" />
          </div>
          <label className="block text-sm font-medium">
            Densidad visual (slides)
            <select
              value={density}
              onChange={(e) =>
                setDensity((e.target.value || "") as "" | "compact" | "airy")
              }
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Auto por modo</option>
              <option value="airy">Aireada</option>
              <option value="compact">Compacta</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Estilo CTA en imagen
            <select
              value={ctaStyle}
              onChange={(e) =>
                setCtaStyle((e.target.value || "") as "" | "pill" | "underline" | "boxed")
              }
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Auto por modo</option>
              <option value="pill">Píldora</option>
              <option value="boxed">Caja</option>
              <option value="underline">Subrayado</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Ubicación del producto (portada)
            <select
              value={placement}
              onChange={(e) =>
                setPlacement((e.target.value || "") as "" | "end" | "start" | "center")
              }
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Auto por modo</option>
              <option value="end">Derecha (feed típico)</option>
              <option value="start">Izquierda</option>
              <option value="center">Centro / hero</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Longitud captions (guía para IA)
            <select
              value={captionStyle}
              onChange={(e) =>
                setCaptionStyle((e.target.value || "") as "" | "short" | "standard" | "long")
              }
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Equilibrado</option>
              <option value="short">Corto</option>
              <option value="standard">Estándar</option>
              <option value="long">Largo</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Escala tipografía en slides ({typeScale.toFixed(2)})
            <input
              type="range"
              min={0.85}
              max={1.25}
              step={0.02}
              value={typeScale}
              onChange={(e) => setTypeScale(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-sm font-medium">
            Intensidad velo sobre textura fal ({textureBoost.toFixed(2)})
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={textureBoost}
              onChange={(e) => setTextureBoost(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--accent-fg)] disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
