import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"

/**
 * Integración con Carlos Gutiérrez. Sin lógica real todavía.
 *
 * Investigación (2026-07-26): tienda de electrodomésticos/TVs. Es una SPA
 * en React (desarrollada por Xmartlabs) — el catálogo se carga por una API
 * que todavía no se localizó en las requests observadas (solo se vieron
 * assets estáticos). robots.txt vacío (sin restricciones declaradas).
 * Pendiente de investigar el endpoint real de catálogo/búsqueda en una
 * iteración futura.
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

  async searchProducts(_query: string): Promise<StoreSearchHit[]> {
    // TODO: implementar integración real con Carlos Gutiérrez.
    return []
  }

  async fetchProductBySlug(_slug: string): Promise<StoreSearchHit | null> {
    // TODO: implementar integración real con Carlos Gutiérrez.
    return null
  }
}
