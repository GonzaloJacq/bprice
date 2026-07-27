import type { Price } from "./price.types"
import type { Product } from "./product.types"

/**
 * Metadata identificando a qué tienda pertenece un StoreProvider.
 */
export interface Provider {
  id: string
  storeSlug: string
  displayName: string
}

/**
 * Un resultado de búsqueda real siempre trae el producto junto a su precio
 * en esa tienda — a diferencia del catálogo (`Product`) y el precio
 * (`Price`), que son entidades separadas pensadas para una fuente de datos
 * propia que todavía no existe.
 */
export interface StoreSearchHit {
  product: Product
  price: Price
}

/**
 * Contrato que debe implementar cada integración por tienda (scraper, API,
 * etc.). `fetchProducts`/`fetchPrice` quedan definidos para cuando exista
 * una fuente de datos propia, pero hoy nada en la UI los usa. Ver
 * src/services/store-providers para el estado real de cada integración.
 */
export interface StoreProvider {
  readonly metadata: Provider

  fetchProducts(): Promise<Product[]>
  fetchPrice(productId: string): Promise<Price | null>
  searchProducts(query: string): Promise<StoreSearchHit[]>
  fetchProductBySlug(slug: string): Promise<StoreSearchHit | null>
}
