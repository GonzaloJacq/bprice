import { API_CONFIG } from "@/shared/constants/api"
import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"
import { buildProductSlug, parseProductSlug } from "@/shared/utils/product-slug"

const SITE_URL = "https://www.carlosgutierrez.com.uy"
const API_URL = "https://api.carlosgutierrez.com.uy/CGSAWebApiV2/api/articulos"
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

/** Precio "de contado" (1 pago) — el resto de `PrecioVigente` son planes en cuotas, no comparables 1 a 1 con el resto de las tiendas. */
const CASH_INSTALLMENT_COUNT = 1

interface CGPrecioVigente {
  PViPrecio: number
  TipoCuota: { TCuCantidad: number }
}

interface CGArticulo {
  ArtId: number
  ArtNombre: string
  Marca: { MarNombre: string } | null
  TiposDeArticulos: { TArNombre: string } | null
  ArticulosImagenes: { AImImagen: string; AImOrden: number }[] | null
  PrecioVigente: CGPrecioVigente[] | null
  HabilitadoVenta: boolean
}

function requestHeaders(refererPath: string): HeadersInit {
  return {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
    Origin: SITE_URL,
    Referer: `${SITE_URL}${refererPath}`,
  }
}

/**
 * Convierte un `CGArticulo` crudo de la API en un `StoreSearchHit`. `null` si
 * no está habilitado para venta web o no tiene precio de contado vigente
 * (`PrecioVigente` viene `null`/vacío para artículos deshabilitados).
 */
function parseArticulo(raw: CGArticulo, storeId: string): StoreSearchHit | null {
  if (!raw.HabilitadoVenta) return null

  const cashPrice = raw.PrecioVigente?.find(
    (entry) => entry.TipoCuota.TCuCantidad === CASH_INSTALLMENT_COUNT
  )
  if (!cashPrice) return null

  const realSlug = String(raw.ArtId)
  const productId = buildProductSlug(STORE_SLUGS.carlosGutierrez, realSlug)
  const imageUrl =
    [...(raw.ArticulosImagenes ?? [])].sort((a, b) => a.AImOrden - b.AImOrden)[0]?.AImImagen ?? null

  const product: Product = {
    id: productId,
    slug: productId,
    name: raw.ArtNombre.trim(),
    brand: raw.Marca?.MarNombre.trim() || null,
    category: raw.TiposDeArticulos?.TArNombre.trim() || "Electrónica",
    imageUrl,
    unit: "",
    sourceUrl: `${SITE_URL}/products/${raw.ArtId}`,
  }

  const price: Price = {
    id: `${productId}-price`,
    productId,
    storeId,
    amount: cashPrice.PViPrecio,
    // La API no expone moneda: Carlos Gutiérrez es una tienda local de
    // electrodomésticos/TVs que cotiza en pesos uruguayos, a diferencia de
    // Thot/Banifox (informática, cotizan en USD).
    currency: "UYU",
    capturedAt: new Date().toISOString(),
  }

  return { product, price }
}

/**
 * Integración real con Carlos Gutiérrez. La SPA (React, Xmartlabs) consume
 * una API JSON propia con CORS abierto (`Access-Control-Allow-Origin: *`) —
 * se llama directo, sin necesidad de browser headless. robots.txt sin
 * restricciones declaradas.
 */
export class CarlosGutierrezProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "carlos-gutierrez-provider",
    storeSlug: STORE_SLUGS.carlosGutierrez,
    displayName: "Carlos Gutiérrez",
  }

  async fetchProducts(): Promise<Product[]> {
    return []
  }

  async fetchPrice(): Promise<Price | null> {
    return null
  }

  async searchProducts(query: string): Promise<StoreSearchHit[]> {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return []

    const url = `${API_URL}/ObtenerProductosBusqueda/?busqueda=${encodeURIComponent(trimmedQuery)}&filtroBusquedaIntra=3`
    const results = await this.fetchJson<CGArticulo[]>(url, `/search?q=${encodeURIComponent(trimmedQuery)}`)
    if (!results) return []

    return results.map((raw) => parseArticulo(raw, this.metadata.id)).filter((hit) => hit !== null)
  }

  async fetchProductBySlug(slug: string): Promise<StoreSearchHit | null> {
    const realSlug = parseProductSlug(slug)?.realSlug
    if (!realSlug) return null

    const raw = await this.fetchJson<CGArticulo>(`${API_URL}/${realSlug}`, `/products/${realSlug}`)
    return raw ? parseArticulo(raw, this.metadata.id) : null
  }

  private async fetchJson<T>(url: string, refererPath: string): Promise<T | null> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs)

    try {
      const response = await fetch(url, {
        headers: requestHeaders(refererPath),
        signal: controller.signal,
        next: { revalidate: API_CONFIG.revalidateSeconds },
      })
      if (!response.ok) return null
      return (await response.json()) as T
    } catch {
      return null
    } finally {
      clearTimeout(timeout)
    }
  }
}
