"use client"

import { useQuery } from "@tanstack/react-query"

import { getProductOffersAction } from "@/features/products/actions/get-product-offers.action"
import { PRODUCT_QUERY_KEYS } from "@/features/products/constants/products.constants"

export function useProductOffers(slug: string) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.offers(slug),
    queryFn: () => getProductOffersAction(slug),
    enabled: Boolean(slug),
  })
}
