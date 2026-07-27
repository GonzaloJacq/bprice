import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"

/**
 * Integración con Tiendamia. Sin lógica real todavía.
 *
 * Investigación (2026-07-27): "compra en USA" — importa productos de
 * retailers estadounidenses (electrónica, moda, etc.), no vende almacén.
 * Plataforma Magento 2. Tanto la home como los resultados de
 * `/catalogsearch/result/?q=` no traen el grid de productos en el HTML
 * inicial — se arma 100% client-side vía JS, así que un `fetch` de
 * servidor simple no alcanza (haría falta un browser headless). Además su
 * robots.txt **prohíbe explícitamente** `/ajax/`, `/api/`, `/rest/` y
 * `/graphql/` (por donde sale esa data) y también `/producto` (las fichas
 * de producto individuales) para todos los user-agents, AI crawlers
 * incluidos — no hay una vía respetuosa de robots.txt para traer ni
 * listados ni fichas de producto hoy. Pendiente de una iteración futura
 * (browser headless + revisar si hay un endpoint público alternativo).
 */
export class TiendamiaProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "tiendamia-provider",
    storeSlug: STORE_SLUGS.tiendamia,
    displayName: "Tiendamia",
  }

  async fetchProducts(): Promise<Product[]> {
    // TODO: implementar integración real con Tiendamia.
    return []
  }

  async fetchPrice(_productId: string): Promise<Price | null> {
    // TODO: implementar integración real con Tiendamia.
    return null
  }

  async searchProducts(_query: string): Promise<StoreSearchHit[]> {
    // TODO: implementar integración real con Tiendamia.
    return []
  }

  async fetchProductBySlug(_slug: string): Promise<StoreSearchHit | null> {
    // TODO: implementar integración real con Tiendamia.
    return null
  }
}
