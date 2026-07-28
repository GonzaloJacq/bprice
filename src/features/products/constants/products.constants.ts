export const PRODUCT_QUERY_KEYS = {
  detail: (slug: string) => ["product", slug] as const,
  offers: (slug: string) => ["product", slug, "offers"] as const,
}
