import type { Product } from "./product.types"

/**
 * Resultado paginado de una búsqueda de productos.
 */
export interface SearchResult {
  products: Product[]
  totalCount: number
  page: number
  pageSize: number
}
