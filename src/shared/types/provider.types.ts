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
 * Contrato que debe implementar cada integración por tienda (scraper, API, etc.).
 * Ningún método tiene lógica real todavía — ver src/services/store-providers.
 */
export interface StoreProvider {
  readonly metadata: Provider

  fetchProducts(): Promise<Product[]>
  fetchPrice(productId: string): Promise<Price | null>
  searchProducts(query: string): Promise<Product[]>
}
