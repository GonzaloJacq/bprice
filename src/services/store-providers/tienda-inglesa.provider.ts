import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider } from "@/shared/types"

/**
 * Integración con Tienda Inglesa. Sin lógica real todavía: cada método
 * queda como stub hasta implementar el scraping/llamada real a esta tienda.
 */
export class TiendaInglesaProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "tienda-inglesa-provider",
    storeSlug: STORE_SLUGS.tiendaInglesa,
    displayName: "Tienda Inglesa",
  }

  async fetchProducts(): Promise<Product[]> {
    // TODO: implementar integración real con Tienda Inglesa.
    return []
  }

  async fetchPrice(_productId: string): Promise<Price | null> {
    // TODO: implementar integración real con Tienda Inglesa.
    return null
  }

  async searchProducts(_query: string): Promise<Product[]> {
    // TODO: implementar integración real con Tienda Inglesa.
    return []
  }
}
