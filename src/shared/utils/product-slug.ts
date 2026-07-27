const SLUG_SEPARATOR = "__"

/**
 * Los slugs de producto que exponemos son namespaced por tienda
 * (`<storeSlug>__<slugReal>`) para que no colisionen cuando varias tiendas
 * reales tengan productos con el mismo slug.
 */
export function buildProductSlug(storeSlug: string, realSlug: string): string {
  return `${storeSlug}${SLUG_SEPARATOR}${realSlug}`
}

export function parseProductSlug(slug: string): { storeSlug: string; realSlug: string } | null {
  const separatorIndex = slug.indexOf(SLUG_SEPARATOR)
  if (separatorIndex === -1) return null

  return {
    storeSlug: slug.slice(0, separatorIndex),
    realSlug: slug.slice(separatorIndex + SLUG_SEPARATOR.length),
  }
}
