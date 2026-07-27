import type { Repository } from "@/repositories/base.repository"
import { STORE_PROVIDERS } from "@/services/store-providers"
import type { Store } from "@/shared/types"

/**
 * Repository de tiendas. Hoy construye la lista a partir del registro
 * estático STORE_PROVIDERS; cuando exista una fuente de datos real
 * (DB/API propia), este es el único archivo que debería cambiar — ni las
 * actions ni los hooks que lo consumen se ven afectados.
 */
class StoreRepository implements Repository<Store, string> {
  async findAll(): Promise<Store[]> {
    // TODO: reemplazar por una fuente de datos real cuando exista.
    return Object.values(STORE_PROVIDERS).map((provider) => ({
      id: provider.metadata.id,
      slug: provider.metadata.storeSlug,
      name: provider.metadata.displayName,
      logoUrl: null,
      websiteUrl: "",
      isActive: true,
    }))
  }

  async findById(id: string): Promise<Store | null> {
    const stores = await this.findAll()
    return stores.find((store) => store.id === id) ?? null
  }

  async findBySlug(slug: string): Promise<Store | null> {
    const stores = await this.findAll()
    return stores.find((store) => store.slug === slug) ?? null
  }
}

export const storeRepository = new StoreRepository()
