import { STORE_PROVIDERS } from "./index"
import type { StoreSearchHit } from "@/shared/types"

/**
 * Busca en paralelo en todos los STORE_PROVIDERS. Si un provider falla o
 * todavía es un stub, `Promise.allSettled` evita que tumbe la búsqueda de
 * los demás — simplemente aporta cero resultados. Compartido entre
 * `features/search` y `features/products` (ver `ProductRepository.findOffersBySlug`)
 * para que ninguna feature dependa de la otra.
 */
export async function searchAllProviders(query: string): Promise<StoreSearchHit[]> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const results = await Promise.allSettled(
    Object.values(STORE_PROVIDERS).map((provider) => provider.searchProducts(trimmedQuery))
  )

  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
}
