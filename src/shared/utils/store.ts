import { SUPPORTED_STORES } from "@/shared/constants/stores"

/** Nombre de tienda para mostrar en UI a partir de su slug. Fallback genérico si no se reconoce. */
export function resolveStoreName(storeSlug: string | undefined): string {
  return SUPPORTED_STORES.find((store) => store.slug === storeSlug)?.name ?? "Tienda"
}
