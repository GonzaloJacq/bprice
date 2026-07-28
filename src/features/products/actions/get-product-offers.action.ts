"use server"

import { productRepository } from "@/features/products/repositories/product.repository"
import { matchProducts } from "@/shared/utils/product-matcher"
import type { MatchedProduct } from "@/shared/types"

/** Ofertas de todas las tiendas para el producto ancla identificado por `slug`. */
export async function getProductOffersAction(slug: string): Promise<MatchedProduct | null> {
  const hits = await productRepository.findOffersBySlug(slug)
  if (!hits) return null

  const groups = matchProducts(hits)
  return groups.find((group) => group.offers.some((offer) => offer.product.slug === slug)) ?? null
}
