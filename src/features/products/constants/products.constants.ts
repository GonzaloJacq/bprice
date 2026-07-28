export const PRODUCT_QUERY_KEYS = {
  offers: (slug: string) => ["product", slug, "offers"] as const,
}
