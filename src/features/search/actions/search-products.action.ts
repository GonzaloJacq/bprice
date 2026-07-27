"use server"

import { searchRepository } from "@/features/search/repositories/search.repository"
import type { StoreSearchHit } from "@/shared/types"

export async function searchProductsAction(query: string): Promise<StoreSearchHit[]> {
  return searchRepository.searchAcrossProviders(query)
}
