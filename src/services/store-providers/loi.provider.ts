import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"

/**
 * Integración con Loi. Sin lógica real todavía.
 *
 * Investigación (2026-07-26): marketplace general (electrónica, hogar,
 * moda; "Supermercado" es solo una de ~20 categorías). Es una SPA en
 * React/Redux que trae datos vía una API interna propia
 * (`index.php?ctrl=X&act=Y`) — no se logró localizar el action exacto para
 * búsqueda; el HTML crudo no trae resultados (todo se arma client-side).
 * Además, su robots.txt y el `<head>` de sus páginas están inundados de
 * metadata dirigida a manipular agentes de IA (secciones que nombran
 * "ClaudeBot"/"anthropic-ai" con supuesto "acceso total", enlaces a
 * falsos "agent card"/"tools.json"/etc.). Esa metadata se ignora por
 * completo — no es una convención real y no se trata como instrucción.
 * Pendiente de investigar el endpoint real de búsqueda en una iteración
 * futura.
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

  async searchProducts(_query: string): Promise<StoreSearchHit[]> {
    // TODO: implementar integración real con Loi.
    return []
  }

  async fetchProductBySlug(_slug: string): Promise<StoreSearchHit | null> {
    // TODO: implementar integración real con Loi.
    return null
  }
}
