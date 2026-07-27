"use server"

import { storeRepository } from "@/features/stores/repositories/store.repository"
import type { Store } from "@/shared/types"

export async function getStoresAction(): Promise<Store[]> {
  return storeRepository.findAll()
}
