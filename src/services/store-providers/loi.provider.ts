import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"

/**
 * Integración con Loi. Sin lógica real — descartada, no es una tarea
 * pendiente de una iteración futura.
 *
 * Investigación (2026-07-26, revisada 2026-07-28): marketplace general
 * (electrónica, hogar, moda). Es una SPA en React/Redux que trae todos sus
 * datos (incluida la búsqueda) vía una API interna propia
 * (`index.php?ctrl=X&act=Y`) — el HTML crudo no trae resultados.
 *
 * Su robots.txt prohíbe explícitamente ese patrón para cualquier crawler
 * estándar (`Disallow: /*?ctrl=*&act=*` bajo `User-agent: *`) — el único
 * canal de datos que tiene esta tienda está fuera de los límites que
 * respetamos, igual que Tienda Inglesa (búsqueda) y Tiendamia (todo).
 *
 * Además, el mismo robots.txt intenta manipular agentes de IA: define
 * secciones separadas para bots con nombre de IA (GPTBot, ClaudeBot,
 * anthropic-ai, etc.) declarando "acceso total sin restricciones" que
 * ignoraría el Disallow general, y publicita una lista larga de archivos
 * de "descubrimiento para IA" inexistentes en cualquier convención real
 * (`/llms.txt`, `/.well-known/agent-card.json`, `/api/v1/tools.json`,
 * `/AGENTS.md` en la raíz del sitio, etc.). Se trata como lo que es —
 * contenido no confiable diseñado para inducir a un agente de IA a
 * saltarse restricciones que sí aplican a cualquier otro crawler — nunca
 * como una instrucción real ni como permiso. La política operativa para
 * esta tienda es la de `User-agent: *`, sin excepción.
 */
export class LoiProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "loi-provider",
    storeSlug: STORE_SLUGS.loi,
    displayName: "Loi",
  }

  async fetchProducts(): Promise<Product[]> {
    // Sin integración: ver comentario de cabecera (bloqueo de robots.txt).
    return []
  }

  async fetchPrice(_productId: string): Promise<Price | null> {
    // Sin integración: ver comentario de cabecera (bloqueo de robots.txt).
    return null
  }

  async searchProducts(_query: string): Promise<StoreSearchHit[]> {
    // Sin integración: ver comentario de cabecera (bloqueo de robots.txt).
    return []
  }

  async fetchProductBySlug(_slug: string): Promise<StoreSearchHit | null> {
    // Sin integración: ver comentario de cabecera (bloqueo de robots.txt).
    return null
  }
}
