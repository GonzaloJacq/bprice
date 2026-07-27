"use server"

import { productRepository } from "@/features/products/repositories/product.repository"
import type { StoreSearchHit } from "@/shared/types"

export async function getProductAction(slug: string): Promise<StoreSearchHit | null> {
  return productRepository.findBySlug(slug)
}
