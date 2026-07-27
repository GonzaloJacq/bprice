import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider } from "@/shared/types"

/**
 * Integración con Loi. Sin lógica real todavía: cada método queda como
 * stub hasta implementar el scraping/llamada real a esta tienda.
 */
export class LoiProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "loi-provider",
    storeSlug: STORE_SLUGS.loi,
    displayName: "Loi",
  }

  async fetchProducts(): Promise<Product[]> {
    // TODO: implementar integración real con Loi.
    return []
  }

  async fetchPrice(_productId: string): Promise<Price | null> {
    // TODO: implementar integración real con Loi.
    return null
  }

  async searchProducts(_query: string): Promise<Product[]> {
    // TODO: implementar integración real con Loi.
    return []
  }
}
