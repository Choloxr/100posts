"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MODE_KEYS, modeLabel, type ModeKey } from "@/lib/modes/catalog";

function ModeSlot({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ModeKey;
  onChange: (v: ModeKey) => void;
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

export function ProductForm({
  defaultModes,
}: {
  defaultModes: [ModeKey, ModeKey, ModeKey];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [specs, setSpecs] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [m0, setM0] = useState<ModeKey>(defaultModes[0]);
  const [m1, setM1] = useState<ModeKey>(defaultModes[1]);
  const [m2, setM2] = useState<ModeKey>(defaultModes[2]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setM0(defaultModes[0]);
    setM1(defaultModes[1]);
    setM2(defaultModes[2]);
  }, [defaultModes]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (new Set([m0, m1, m2]).size !== 3) {
      setMsg("Elegí tres modos distintos.");
      return;
    }
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
          modeKeys: [m0, m1, m2],
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

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[var(--fg)]">Modos para esta corrida</legend>
        <p className="text-xs text-[var(--muted)]">
          Tres estilos distintos (feed vende estética). Se genera un carrusel por modo.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <ModeSlot label="Post 1" value={m0} onChange={setM0} />
          <ModeSlot label="Post 2" value={m1} onChange={setM1} />
          <ModeSlot label="Post 3" value={m2} onChange={setM2} />
        </div>
      </fieldset>

      <label className="block text-sm font-medium">
        Nombre del producto
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder="Samsung Galaxy A55 5G"
        />
      </label>
      <label className="block text-sm font-medium">
        Precio (texto a mostrar)
        <input
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder="$ 349.999"
        />
      </label>
      <label className="block text-sm font-medium">
        Specs / notas
        <textarea
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder="Pantalla 6.6 pulgadas Super AMOLED, 8GB RAM, 128GB, batería 5000mAh…"
        />
      </label>
      <label className="block text-sm font-medium">
        Fotos del producto (opcional, hasta 5)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="mt-1 block w-full text-sm text-[var(--muted)]"
        />
      </label>
      {msg ? <p className="text-sm text-red-500">{msg}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--accent-fg)] disabled:opacity-50"
      >
        {busy ? "Generando… (~20–60s)" : "Generar 3 posts"}
      </button>
    </form>
  );
}
