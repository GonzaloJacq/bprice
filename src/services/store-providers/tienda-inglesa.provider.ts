import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"

/**
 * Integración con Tienda Inglesa. Sin lógica real todavía.
 *
 * Investigación (2026-07-26): el único supermercado real de las 5 tiendas.
 * Corre sobre GeneXus (todo por postbacks AJAX con estado de sesión,
 * `gxfullajaxEvt`) — no hay una API JSON limpia, habría que parsear
 * fragmentos de HTML generados dinámicamente por sesión. Además, su
 * robots.txt **prohíbe explícitamente crawlear su búsqueda**
 * (`Disallow: /busqueda?*` y `/supermercado/busqueda?*`), restricción que
 * se respeta — no se automatizan requests contra ese endpoint. Una
 * implementación futura debería apoyarse en páginas de categoría/listado
 * (no restringidas) en vez de su buscador.
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

  async searchProducts(_query: string): Promise<StoreSearchHit[]> {
    // TODO: implementar integración real con Tienda Inglesa (respetando el
    // Disallow de robots.txt sobre /busqueda).
    return []
  }

  async fetchProductBySlug(_slug: string): Promise<StoreSearchHit | null> {
    // TODO: implementar integración real con Tienda Inglesa.
    return null
  }
}
