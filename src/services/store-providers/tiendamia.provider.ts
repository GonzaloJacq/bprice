import { load } from "cheerio"

import { API_CONFIG } from "@/shared/constants/api"
import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"
import { buildProductSlug, parseProductSlug } from "@/shared/utils/product-slug"

const BASE_URL = "https://tiendamia.com.uy"
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

/**
 * `/catalogsearch/result/?q=` (buscador genérico de Magento) no sirve: no
 * trae resultados server-side para este catálogo multi-proveedor. Tiendamia
 * en cambio expone su propio buscador por proveedor en
 * `/search/<vendor>/<query>` (vendors: amazon/ebay/china) — confirmado con
 * el HTML real de `/search/amazon/teclado`: el grid completo viene en el
 * documento inicial, un `.item-card` por producto con `data-sku`/`data-price`/
 * `data-name` en el propio elemento. No hace falta browser headless.
 *
 * robots.txt solo prohíbe `/checkout/`, `/cart/`, `/customer/`, `/producto`,
 * `/ajax/`, `/api/`, `/rest/`, `/graphql/` y algunos query params — nada de
 * eso coincide con `/search/<vendor>/<query>` ni con las fichas reales, que
 * son `/p/<fuente>/<id>/<slug-seo>` (no `/producto`).
 */
const DEFAULT_VENDOR = "amazon"

function buildSearchUrl(query: string, vendor: string): string {
  const encodedQuery = query
    .trim()
    .split(/\s+/)
    .map(encodeURIComponent)
    .join("+")
  return `${BASE_URL}/search/${vendor}/${encodedQuery}`
}

function normalizeCurrency(hint: string): string {
  if (hint.includes("U$S") || hint.trim().toUpperCase() === "USD") return "USD"
  if (hint.includes("$")) return "UYU"
  return "USD"
}

/**
 * Fichas reales son `/p/<fuente>/<id>/<slug-seo>`. Guardamos los 3 segmentos
 * unidos con "-" como slug propio (nunca con "/", que rompería nuestra ruta
 * de un solo segmento `/products/[slug]`) para poder reconstruir la URL
 * exacta más adelante — probamos con un slug SEO placeholder primero y la
 * ficha no resolvía: a diferencia de Banifox, acá el slug SEO sí importa.
 * `fuente`/`id` nunca traen "-" en los casos observados (ids alfanuméricos
 * sin separador), así que solo el resto después del segundo "-" es el slug
 * SEO real (que sí puede tener "-" de sobra).
 */
function extractProductPathParts(href: string): { source: string; id: string; seoSlug: string } | null {
  const match = /\/p\/([^/]+)\/([^/]+)\/([^/?#]+)/.exec(href)
  return match ? { source: match[1], id: match[2], seoSlug: match[3] } : null
}

function splitRealSlug(realSlug: string): { source: string; id: string; seoSlug: string } | null {
  const [source, id, ...seoSlugParts] = realSlug.split("-")
  if (!source || !id || seoSlugParts.length === 0) return null
  return { source, id, seoSlug: seoSlugParts.join("-") }
}

interface ParsedProductMeta {
  name: string
  imageUrl: string | null
  amount: number
  currency: string
  brand: string | null
}

/**
 * La ficha (`/p/<fuente>/<id>/<slug>`) NO trae JSON-LD `Product` — confirmado
 * contra HTML real, a diferencia de lo que se había asumido antes. Sí trae
 * metatags Open Graph / `product:*` limpios (`og:title`, `product:price:amount`,
 * `product:price:currency`, `product:brand`, `og:image`), pensados para
 * compartir en redes — se usan esos en vez de intentar parsear el markup de
 * la página (mucho más frágil, ligado a la UI de Magento/Knockout).
 */
function parseProductMeta($: ReturnType<typeof load>): ParsedProductMeta | null {
  const meta = (property: string): string | null =>
    $(`meta[property="${property}"]`).first().attr("content") ?? null

  const name = meta("og:title")
  const amountText = meta("product:price:amount")
  const currency = meta("product:price:currency") ?? "USD"
  const brand = meta("product:brand")
  // La URL de imagen trae un placeholder de tamaño literal ("TMWIDTHxTMHEIGHT") que el sitio resuelve client-side.
  const rawImage = meta("og:image")
  const imageUrl = rawImage ? rawImage.replace("TMWIDTHxTMHEIGHT", "300x300") : null

  if (!name || !amountText) return null
  const amount = Number.parseFloat(amountText)
  if (!Number.isFinite(amount)) return null

  return { name, imageUrl, amount, currency, brand }
}

export class TiendamiaProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "tiendamia-provider",
    storeSlug: STORE_SLUGS.tiendamia,
    displayName: "Tiendamia",
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

    const html = await this.fetchHtml(buildSearchUrl(trimmedQuery, DEFAULT_VENDOR))
    if (!html) return []

    return this.parseItemCards(load(html))
  }

  private parseItemCards($: ReturnType<typeof load>): StoreSearchHit[] {
    const hits: StoreSearchHit[] = []

    $(".item-card").each((_, element) => {
      const item = $(element)
      const href = item.find("a.item-link").first().attr("href")
      const pathParts = href ? extractProductPathParts(href) : null
      if (!href || !pathParts) return

      const name = item.attr("data-name")?.trim()
      const priceAttr = item.attr("data-price")
      const amount = priceAttr ? Number.parseFloat(priceAttr) : null
      if (!name || amount === null || !Number.isFinite(amount)) return

      const priceText = item.find(".item-price-main").first().text()
      const currency = normalizeCurrency(priceText || "U$S")
      const brand = item.find(".item-brand").first().text().trim() || null
      const imageUrl = item.find("img.item-image").first().attr("src") ?? null
      const realSlug = `${pathParts.source}-${pathParts.id}-${pathParts.seoSlug}`

      hits.push(this.buildHit(realSlug, name, amount, currency, brand, imageUrl, href))
    })

    return hits
  }

  async fetchProductBySlug(slug: string): Promise<StoreSearchHit | null> {
    const realSlug = parseProductSlug(slug)?.realSlug
    const pathParts = realSlug ? splitRealSlug(realSlug) : null
    if (!realSlug || !pathParts) return null

    const detailUrl = `${BASE_URL}/p/${pathParts.source}/${pathParts.id}/${pathParts.seoSlug}`
    const html = await this.fetchHtml(detailUrl)
    if (!html) return null

    const parsed = parseProductMeta(load(html))
    if (!parsed) return null

    return this.buildHit(
      realSlug,
      parsed.name,
      parsed.amount,
      parsed.currency,
      parsed.brand,
      parsed.imageUrl,
      detailUrl
    )
  }

  private buildHit(
    realSlug: string,
    name: string,
    amount: number,
    currency: string,
    brand: string | null,
    imageUrl: string | null,
    sourceUrl: string
  ): StoreSearchHit {
    const productId = buildProductSlug(this.metadata.storeSlug, realSlug)

    const product: Product = {
      id: productId,
      slug: productId,
      name,
      brand,
      category: "Electrónica",
      imageUrl,
      unit: "",
      sourceUrl,
    }

    const price: Price = {
      id: `${productId}-price`,
      productId,
      storeId: this.metadata.id,
      amount,
      currency,
      capturedAt: new Date().toISOString(),
    }

    return { product, price }
  }

  private async fetchHtml(url: string): Promise<string | null> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs)

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: controller.signal,
        next: { revalidate: API_CONFIG.revalidateSeconds },
      })
      if (!response.ok) return null
      return await response.text()
    } catch {
      return null
    } finally {
      clearTimeout(timeout)
    }
  }
}
