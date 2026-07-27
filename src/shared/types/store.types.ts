/**
 * Un supermercado/tienda soportado por la plataforma.
 */
export interface Store {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  websiteUrl: string
  isActive: boolean
}
