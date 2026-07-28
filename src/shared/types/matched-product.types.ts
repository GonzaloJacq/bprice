import type { StoreSearchHit } from "./provider.types"

/**
 * Un producto agrupado a través de tiendas: mismo producto (por heurística de
 * nombre, ver `shared/utils/product-matcher`), con una oferta por cada tienda
 * que lo vende. `offers` siempre tiene al menos 1 elemento — un hit sin match
 * con ningún otro sigue siendo su propio grupo de 1 sola oferta.
 */
export interface MatchedProduct {
  /** Slug del hit representativo (el más barato) — estable solo dentro de la misma response. */
  id: string
  name: string
  brand: string | null
  imageUrl: string | null
  category: string
  offers: StoreSearchHit[]
}
