"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { POST_TYPES, postTypeLabel, type PostType } from "@/lib/product/post-type";

/** Aligned with 3 variants per run; replace when billing tracks real credits. */
const CREDITS_PER_RUN = 3;

export function ProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [specs, setSpecs] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [postType, setPostType] = useState<PostType>("sale");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: product, error: insErr } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          name: name.trim(),
          price: price.trim(),
          specs: specs.trim() || null,
          image_paths: [],
        })
        .select("id")
        .single();

      if (insErr || !product) {
        throw new Error(insErr?.message ?? "No se pudo crear el producto");
      }

      const productId = product.id as string;
      const paths: string[] = [];

      if (files?.length) {
        const max = Math.min(files.length, 5);
        for (let i = 0; i < max; i++) {
          const file = files.item(i);
          if (!file) continue;
          const safe = file.name.replace(/[^\w.\-]+/g, "_");
          const path = `${user.id}/${productId}/${Date.now()}-${safe}`;
          const { error: upErr } = await supabase.storage
            .from("product-images")
            .upload(path, file, { upsert: true });
          if (upErr) {
            throw new Error(upErr.message);
          }
          paths.push(path);
        }
        const { error: upProdErr } = await supabase
          .from("products")
          .update({ image_paths: paths })
          .eq("id", productId);
        if (upProdErr) {
          throw new Error(upProdErr.message);
        }
      }

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          postType,
        }),
      });
      const genJson = (await genRes.json()) as { runId?: string; error?: string };
      if (!genRes.ok) {
        throw new Error(genJson.error ?? "Falló la generación");
      }
      if (!genJson.runId) {
        throw new Error("Respuesta inválida");
      }

      router.push(`/runs/${genJson.runId}`);
      router.refresh();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-input border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition-all duration-fast placeholder:text-[var(--muted2)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]";

  const selectClass =
    "mt-1.5 w-full rounded-input border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition-all duration-fast focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]";

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-5 rounded-card border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      <label className="block text-sm font-semibold text-[var(--fg)]">
        Nombre del producto
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Samsung Galaxy A55 5G"
        />
      </label>

      <label className="block text-sm font-semibold text-[var(--fg)]">
        Precio
        <input
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClass}
          placeholder="$ 349.999"
        />
      </label>

      <label className="block text-sm font-semibold text-[var(--fg)]">
        Fotos (opcional, hasta 5)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="mt-1.5 block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-btn file:border-0 file:bg-[var(--accent)]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--accent)] hover:file:bg-[var(--accent)]/20"
        />
      </label>

      <details className="rounded-card border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--fg)]">
          Agregar detalles opcionales
        </summary>
        <label className="mt-4 block text-xs font-medium text-[var(--muted)]">
          Specs / notas para la IA
          <textarea
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            rows={4}
            className={`${inputClass} mt-1.5 resize-none`}
            placeholder="Pantalla 6.6 pulgadas Super AMOLED, 8GB RAM, 128GB, batería 5000mAh…"
          />
        </label>
      </details>

      <label className="block text-sm font-semibold text-[var(--fg)]">
        Tipo de post
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value as PostType)}
          className={selectClass}
        >
          {POST_TYPES.map((t) => (
            <option key={t} value={t}>
              {postTypeLabel(t)}
            </option>
          ))}
        </select>
        <span className="mt-1.5 block text-xs text-[var(--muted)]">
          Elegimos tres estilos visuales distintos para esta corrida según este tipo.
        </span>
      </label>

      {msg ? (
        <p className="rounded-btn border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2.5 text-sm text-[var(--error)]">
          {msg}
        </p>
      ) : null}

      <div className="space-y-2 pt-1">
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-btn bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--accent-fg)] transition-all duration-fast hover:-translate-y-px hover:shadow-glow disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {busy ? "Generando… (~20–60s)" : "Generar posts"}
        </button>
        <p className="text-center text-xs text-[var(--muted)]">
          Usa {CREDITS_PER_RUN} créditos · tres carruseles listos para publicar
        </p>
      </div>
    </form>
  );
}
