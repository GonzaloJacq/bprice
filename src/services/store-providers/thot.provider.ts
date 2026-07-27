import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider } from "@/shared/types"

/**
 * Integración con Thot. Sin lógica real todavía: cada método queda como
 * stub hasta implementar el scraping/llamada real a esta tienda.
 */
export class ThotProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "thot-provider",
    storeSlug: STORE_SLUGS.thot,
    displayName: "Thot",
  }

  async fetchProducts(): Promise<Product[]> {
    // TODO: implementar integración real con Thot.
    return []
  }

  async fetchPrice(_productId: string): Promise<Price | null> {
    // TODO: implementar integración real con Thot.
    return null
  }

  async searchProducts(_query: string): Promise<Product[]> {
    // TODO: implementar integración real con Thot.
    return []
  }
}
