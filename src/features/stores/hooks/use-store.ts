"use client"

import { useQuery } from "@tanstack/react-query"

import { getStoreBySlugAction } from "@/features/stores/actions/get-store-by-slug.action"
import { STORES_QUERY_KEYS } from "@/features/stores/constants/stores.constants"

export function useStore(slug: string) {
  return useQuery({
    queryKey: STORES_QUERY_KEYS.detail(slug),
    queryFn: () => getStoreBySlugAction(slug),
    enabled: Boolean(slug),
  })
}
