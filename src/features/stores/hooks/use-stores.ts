"use client"

import { useQuery } from "@tanstack/react-query"

import { getStoresAction } from "@/features/stores/actions/get-stores.action"
import { STORES_QUERY_KEYS } from "@/features/stores/constants/stores.constants"

export function useStores() {
  return useQuery({
    queryKey: STORES_QUERY_KEYS.all,
    queryFn: () => getStoresAction(),
  })
}
