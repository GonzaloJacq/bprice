export const PRODUCT_QUERY_KEYS = {
  detail: (slug: string) => ["product", slug] as const,
}
