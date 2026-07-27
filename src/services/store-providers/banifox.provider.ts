import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider } from "@/shared/types"

/**
 * Integración con Banifox. Sin lógica real todavía: cada método queda como
 * stub hasta implementar el scraping/llamada real a esta tienda.
 */
export class BanifoxProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "banifox-provider",
    storeSlug: STORE_SLUGS.banifox,
    displayName: "Banifox",
  }

  async fetchProducts(): Promise<Product[]> {
    // TODO: implementar integración real con Banifox.
    return []
  }

  async fetchPrice(_productId: string): Promise<Price | null> {
    // TODO: implementar integración real con Banifox.
    return null
  }

  async searchProducts(_query: string): Promise<Product[]> {
    // TODO: implementar integración real con Banifox.
    return []
  }
}
