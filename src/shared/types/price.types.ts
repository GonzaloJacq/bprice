/**
 * Precio de un producto en una tienda puntual, capturado en un momento dado.
 */
export interface Price {
  id: string
  productId: string
  storeId: string
  amount: number
  currency: string
  /** ISO 8601 */
  capturedAt: string
}
