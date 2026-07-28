"use server"

import { searchRepository } from "@/features/search/repositories/search.repository"
import { matchProducts } from "@/shared/utils/product-matcher"
import type { MatchedProduct } from "@/shared/types"

export async function searchProductsAction(query: string): Promise<MatchedProduct[]> {
  const hits = await searchRepository.searchAcrossProviders(query)
  return matchProducts(hits)
}
