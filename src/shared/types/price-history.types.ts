export interface PriceHistoryPoint {
  amount: number
  /** ISO 8601 */
  capturedAt: string
}

/**
 * Serie temporal de precios de un producto en una tienda.
 */
export interface PriceHistory {
  productId: string
  storeId: string
  points: PriceHistoryPoint[]
}
