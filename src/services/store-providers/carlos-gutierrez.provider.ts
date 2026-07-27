import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider } from "@/shared/types"

/**
 * Integración con Carlos Gutiérrez. Sin lógica real todavía: cada método
 * queda como stub hasta implementar el scraping/llamada real a esta tienda.
 */
export class CarlosGutierrezProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "carlos-gutierrez-provider",
    storeSlug: STORE_SLUGS.carlosGutierrez,
    displayName: "Carlos Gutiérrez",
  }

  async fetchProducts(): Promise<Product[]> {
    // TODO: implementar integración real con Carlos Gutiérrez.
    return []
  }

  async fetchPrice(_productId: string): Promise<Price | null> {
    // TODO: implementar integración real con Carlos Gutiérrez.
    return null
  }

  async searchProducts(_query: string): Promise<Product[]> {
    // TODO: implementar integración real con Carlos Gutiérrez.
    return []
  }
}
