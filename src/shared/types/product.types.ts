/**
 * Un producto genérico, independiente de la tienda que lo vende.
 */
export interface Product {
  id: string
  slug: string
  name: string
  brand: string | null
  category: string
  imageUrl: string | null
  unit: string
  /** URL de la ficha del producto en la tienda de origen, si se conoce. */
  sourceUrl: string | null
}
