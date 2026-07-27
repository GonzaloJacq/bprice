/**
 * Registro de tiendas soportadas. Es la fuente de verdad única para el slug
 * de cada tienda: tanto services/store-providers como features/stores
 * deben referenciar estos slugs en vez de repetir strings sueltos.
 */
export const STORE_SLUGS = {
  banifox: "banifox",
  loi: "loi",
  thot: "thot",
  carlosGutierrez: "carlos-gutierrez",
  tiendaInglesa: "tienda-inglesa",
  tiendamia: "tiendamia",
} as const

export type StoreSlug = (typeof STORE_SLUGS)[keyof typeof STORE_SLUGS]

export interface SupportedStore {
  slug: StoreSlug
  name: string
}

export const SUPPORTED_STORES: readonly SupportedStore[] = [
  { slug: STORE_SLUGS.banifox, name: "Banifox" },
  { slug: STORE_SLUGS.loi, name: "Loi" },
  { slug: STORE_SLUGS.thot, name: "Thot" },
  { slug: STORE_SLUGS.carlosGutierrez, name: "Carlos Gutiérrez" },
  { slug: STORE_SLUGS.tiendaInglesa, name: "Tienda Inglesa" },
  { slug: STORE_SLUGS.tiendamia, name: "Tiendamia" },
]
