"use client"

import { useQuery } from "@tanstack/react-query"

import { searchProductsAction } from "@/features/search/actions/search-products.action"
import { SEARCH_QUERY_KEYS } from "@/features/search/constants/search.constants"

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: SEARCH_QUERY_KEYS.results(query),
    queryFn: () => searchProductsAction(query),
    enabled: query.trim().length > 0,
  })
}
