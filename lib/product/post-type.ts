export const POST_TYPES = ["sale", "informative", "launch", "offer"] as const;

export type PostType = (typeof POST_TYPES)[number];

export function isPostType(s: string): s is PostType {
  return (POST_TYPES as readonly string[]).includes(s);
}

export function postTypeLabel(t: PostType): string {
  switch (t) {
    case "sale":
      return "Venta";
    case "informative":
      return "Informativo";
    case "launch":
      return "Lanzamiento";
    case "offer":
      return "Oferta";
  }
}
