import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"

/**
 * Integración con Banifox. Sin lógica real todavía.
 *
 * Investigación (2026-07-26): tienda de electrónica/informática, plataforma
 * PHP a medida (`ecms_ajax.php`), detrás de un challenge JS de Cloudflare
 * activo. Un `fetch` de servidor simple probablemente sea bloqueado o
 * desafiado — implementarla de verdad requeriría un browser headless
 * (Playwright/Puppeteer), no solo HTML + cheerio. robots.txt no tiene
 * reglas Disallow tradicionales (usa el formato nuevo de "content signals",
 * ambiguo para scraping propio). Pendiente de una iteración futura.
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

  async searchProducts(_query: string): Promise<StoreSearchHit[]> {
    // TODO: implementar integración real con Banifox.
    return []
  }

  async fetchProductBySlug(_slug: string): Promise<StoreSearchHit | null> {
    // TODO: implementar integración real con Banifox.
    return null
  }
}
