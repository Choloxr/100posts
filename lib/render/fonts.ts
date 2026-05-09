let cache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

export async function loadInterFonts(): Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[]
> {
  if (!cache) {
    const [regular, bold] = await Promise.all([
      fetch(
        "https://unpkg.com/@fontsource/inter@5.0.16/files/inter-latin-400-normal.woff"
      ).then((r) => {
        if (!r.ok) throw new Error("Failed to load Inter 400");
        return r.arrayBuffer();
      }),
      fetch(
        "https://unpkg.com/@fontsource/inter@5.0.16/files/inter-latin-700-normal.woff"
      ).then((r) => {
        if (!r.ok) throw new Error("Failed to load Inter 700");
        return r.arrayBuffer();
      }),
    ]);
    cache = { regular, bold };
  }

  return [
    { name: "Inter", data: cache.regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: cache.bold, weight: 700 as const, style: "normal" as const },
  ];
}
