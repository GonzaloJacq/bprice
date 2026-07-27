import { STORE_PROVIDERS } from "@/services/store-providers"
import type { StoreSearchHit } from "@/shared/types"

/**
 * Busca en paralelo en todos los STORE_PROVIDERS. Si un proveedor falla o
 * todavía es un stub, `Promise.allSettled` evita que tumbe la búsqueda de
 * los demás — simplemente aporta cero resultados.
 */
class SearchRepository {
  async searchAcrossProviders(query: string): Promise<StoreSearchHit[]> {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return []

    const results = await Promise.allSettled(
      Object.values(STORE_PROVIDERS).map((provider) => provider.searchProducts(trimmedQuery))
    )

    return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
  }
}

export const searchRepository = new SearchRepository()
