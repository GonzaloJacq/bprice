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
}
