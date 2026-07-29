import { STORE_PROVIDERS } from "@/services/store-providers"
import { searchAllProviders } from "@/services/store-providers/search-all"
import type { StoreSlug } from "@/shared/constants/stores"
import type { StoreSearchHit } from "@/shared/types"
import { parseProductSlug } from "@/shared/utils/product-slug"

function isStoreSlug(value: string): value is StoreSlug {
  return value in STORE_PROVIDERS
}

/**
 * Los SKU/códigos de parte propios de una tienda (ej. "920-013926",
 * "RZ03-05003400") no aparecen en el listado de ninguna otra tienda, y
 * algunos buscadores (ej. el de Thot, WordPress) devuelven 0 resultados si
 * el término de búsqueda incluye un token que no matchea nada — verificado
 * empíricamente: buscar el nombre completo de un producto de Banifox devolvía
 * 0 resultados en Thot, sin el código SKU devolvía los esperados. Se
 * eliminan antes de re-buscar en `findOffersBySlug`.
 */
function stripSkuTokens(name: string): string {
  return name
    .split(/\s+/)
    .filter((token) => !/\d[a-z0-9]*-[a-z0-9]*\d/i.test(token) && !/^\d{5,}$/.test(token))
    .join(" ")
}

/**
 * Sustantivos de categoría en español que una tienda puede omitir del nombre
 * si ya es obvio por el tipo de producto (ej. Banifox lista "Logitech K270"
 * sin la palabra "Teclado" que sí usa Tiendamia para el mismo producto) —
 * verificado empíricamente. A diferencia de `stripSkuTokens` (códigos de
 * tienda), esto arma una query más angosta (esencialmente marca + modelo)
 * para buscadores que hacen match de frase/substring en vez de por palabra
 * individual, donde una palabra de más rompe el match.
 */
const CATEGORY_NOISE_WORDS = new Set([
  "teclado",
  "teclados",
  "mouse",
  "mause",
  "monitor",
  "monitores",
  "notebook",
  "notebooks",
  "laptop",
  "laptops",
  "celular",
  "celulares",
  "telefono",
  "auriculares",
  "parlante",
  "parlantes",
  "impresora",
  "impresoras",
  "camara",
  "camaras",
  "tablet",
  "tablets",
  "cargador",
  "cargadores",
])

function stripCategoryWords(name: string): string {
  return name
    .split(/\s+/)
    .filter((token) => !CATEGORY_NOISE_WORDS.has(token.toLowerCase()))
    .join(" ")
}

function dedupeHitsBySlug(hits: StoreSearchHit[]): StoreSearchHit[] {
  const seen = new Set<string>()
  const deduped: StoreSearchHit[] = []

  for (const hit of hits) {
    if (seen.has(hit.product.slug)) continue
    seen.add(hit.product.slug)
    deduped.push(hit)
  }

  return deduped
}

/**
 * Un slug de producto es namespaced por tienda (`<storeSlug>__<slugReal>`).
 * Este repository solo decide a qué provider delegar — el parseo del slug
 * real y el fetch en sí quedan enteramente del lado del provider.
 */
class ProductRepository {
  async findBySlug(slug: string): Promise<StoreSearchHit | null> {
    const parsed = parseProductSlug(slug)
    if (!parsed || !isStoreSlug(parsed.storeSlug)) return null

    return STORE_PROVIDERS[parsed.storeSlug].fetchProductBySlug(slug)
  }

  /**
   * No hay catálogo propio: para reunir las ofertas de otras tiendas para un
   * producto puntual, se re-busca por su nombre (sin SKU propio) contra
   * todos los providers y se agrega el hit ancla si el buscador de su propia
   * tienda no lo vuelve a traer (puede pasar; el match del grupo ancla
   * siempre debe existir). El matching en sí queda para la Action, no para
   * el repository.
   *
   * Se corren dos queries en paralelo — el nombre completo (sin SKU) y una
   * versión angosta sin sustantivos de categoría — y se combinan los hits.
   * Cubre tanto buscadores que necesitan el nombre completo como los que
   * hacen match de frase y fallan si sobra una palabra que otra tienda omite.
   */
  async findOffersBySlug(slug: string): Promise<StoreSearchHit[] | null> {
    const anchor = await this.findBySlug(slug)
    if (!anchor) return null

    const fullQuery = stripSkuTokens(anchor.product.name)
    const narrowQuery = stripCategoryWords(fullQuery)
    const queries = narrowQuery && narrowQuery !== fullQuery ? [fullQuery, narrowQuery] : [fullQuery]

    const results = await Promise.all(queries.map((query) => searchAllProviders(query)))
    const secondRound = dedupeHitsBySlug(results.flat())
    const alreadyPresent = secondRound.some((hit) => hit.product.slug === anchor.product.slug)

    return alreadyPresent ? secondRound : [anchor, ...secondRound]
  }
}

export const productRepository = new ProductRepository()
