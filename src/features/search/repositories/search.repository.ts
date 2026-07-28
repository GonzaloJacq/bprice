import { searchAllProviders } from "@/services/store-providers/search-all"
import type { StoreSearchHit } from "@/shared/types"

class SearchRepository {
  async searchAcrossProviders(query: string): Promise<StoreSearchHit[]> {
    return searchAllProviders(query)
  }
}

export const searchRepository = new SearchRepository()
