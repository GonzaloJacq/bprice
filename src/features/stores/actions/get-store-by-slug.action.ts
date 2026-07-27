"use server"

import { storeRepository } from "@/features/stores/repositories/store.repository"
import type { Store } from "@/shared/types"

export async function getStoreBySlugAction(
  slug: string
): Promise<Store | null> {
  return storeRepository.findBySlug(slug)
}
