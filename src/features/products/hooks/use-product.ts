"use client"

import { useQuery } from "@tanstack/react-query"

import { getProductAction } from "@/features/products/actions/get-product.action"
import { PRODUCT_QUERY_KEYS } from "@/features/products/constants/products.constants"

export function useProduct(slug: string) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(slug),
    queryFn: () => getProductAction(slug),
    enabled: Boolean(slug),
  })
}
