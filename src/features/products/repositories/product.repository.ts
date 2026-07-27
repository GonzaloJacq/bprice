import { STORE_PROVIDERS } from "@/services/store-providers"
import type { StoreSlug } from "@/shared/constants/stores"
import type { StoreSearchHit } from "@/shared/types"
import { parseProductSlug } from "@/shared/utils/product-slug"

function isStoreSlug(value: string): value is StoreSlug {
  return value in STORE_PROVIDERS
}

/**
 * Un slug de producto es namespaced por tienda (`<storeSlug>__<slugReal>`).
 * Este repository solo decide a qué provider delegar — el parseo del slug
 * real y el fetch en sí quedan enteramente del lado del provider.
 */
class ProductRepository {
  async findBySlug(slug: string): Promise<StoreSearchHit | null> {
    const parsed = parseProductSlug(slug)
    if (!parsed || !isStoreSlug(parsed.storeSlug)) return null

    return STORE_PROVIDERS[parsed.storeSlug].fetchProductBySlug(slug)
  }
}

export const productRepository = new ProductRepository()
