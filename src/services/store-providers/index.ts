import { STORE_SLUGS, type StoreSlug } from "@/shared/constants/stores"
import type { StoreProvider } from "@/shared/types"

import { BanifoxProvider } from "./banifox.provider"
import { CarlosGutierrezProvider } from "./carlos-gutierrez.provider"
import { LoiProvider } from "./loi.provider"
import { ThotProvider } from "./thot.provider"
import { TiendaInglesaProvider } from "./tienda-inglesa.provider"
import { TiendamiaProvider } from "./tiendamia.provider"

/**
 * Registro central de providers por tienda. Los repositories de features
 * consumen este mapa en vez de instanciar providers directamente.
 */
export const STORE_PROVIDERS: Record<StoreSlug, StoreProvider> = {
  [STORE_SLUGS.banifox]: new BanifoxProvider(),
  [STORE_SLUGS.loi]: new LoiProvider(),
  [STORE_SLUGS.thot]: new ThotProvider(),
  [STORE_SLUGS.carlosGutierrez]: new CarlosGutierrezProvider(),
  [STORE_SLUGS.tiendaInglesa]: new TiendaInglesaProvider(),
  [STORE_SLUGS.tiendamia]: new TiendamiaProvider(),
}

export {
  BanifoxProvider,
  CarlosGutierrezProvider,
  LoiProvider,
  ThotProvider,
  TiendaInglesaProvider,
  TiendamiaProvider,
}
