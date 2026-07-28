import { load } from "cheerio"

import { API_CONFIG } from "@/shared/constants/api"
import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"
import { buildProductSlug, parseProductSlug } from "@/shared/utils/product-slug"

const BASE_URL = "https://thotcomputacion.com.uy"
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

/**
 * El template de búsqueda de Thot solo muestra 3 productos por página (no
 * los 12/24/36 configurables del listado normal), y una búsqueda amplia
 * puede tener decenas de páginas. Paginamos hasta este tope para traer
 * bastantes más resultados que la página 1 sin bombardear el sitio con
 * cientos de requests por búsqueda.
 */
const MAX_SEARCH_PAGES = 8

/** Extrae el slug real de Thot de una URL de producto tipo /producto/<slug>/ */
function extractSlugFromProductUrl(url: string): string | null {
  const match = /\/producto\/([^/]+)\/?/.exec(url)
  return match ? match[1] : null
}

/** "US$1,234.56" → 1234.56. Asume el formato de precio de Thot (punto decimal). */
function parsePriceAmount(text: string): number | null {
  const cleaned = text.replace(/[^\d.,]/g, "").replace(/,/g, "")
  const amount = Number.parseFloat(cleaned)
  return Number.isFinite(amount) ? amount : null
}

/**
 * Thot muestra "US$X" para dólares y "$X" (sin "US") para pesos uruguayos.
 * Acepta también un código ISO ya limpio (ej. viniendo del JSON-LD).
 */
function normalizeCurrency(hint: string): string {
  if (hint.includes("US$") || hint.trim().toUpperCase() === "USD") return "USD"
  if (hint.includes("$")) return "UYU"
  return "USD"
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null
}

interface ProductOffer {
  amount: number
  currency: string
}

/**
 * Una ficha de producto de Thot trae varios `<script type="application/ld+json">`:
 * el de Yoast SEO (WebPage/Organization/... dentro de un array "@graph") y
 * el nativo de WooCommerce, que es directamente un objeto `{"@type":"Product",...}`.
 * Esta función soporta ambas formas.
 */
function findProductNode(document: unknown): Record<string, unknown> | null {
  const record = asRecord(document)
  if (!record) return null
  if (record["@type"] === "Product") return record

  const graphNodes = record["@graph"]
  if (!Array.isArray(graphNodes)) return null

  return graphNodes.map((node) => asRecord(node)).find((node) => node?.["@type"] === "Product") ?? null
}

/**
 * Extrae nombre, imagen y precio del primer Offer de un nodo schema.org
 * Product ya localizado. Devuelve null si le faltan campos esperados (la
 * ficha cambió o no cargó bien).
 */
function extractProductDetails(
  productNode: Record<string, unknown>
): { name: string; imageUrl: string | null; offer: ProductOffer } | null {
  const name = typeof productNode.name === "string" ? productNode.name : null
  const imageUrl = typeof productNode.image === "string" ? productNode.image : null

  const offersValue = productNode.offers
  const offer = asRecord(Array.isArray(offersValue) ? offersValue[0] : offersValue)
  const priceSpecValue = offer?.priceSpecification
  const priceSpec = asRecord(Array.isArray(priceSpecValue) ? priceSpecValue[0] : priceSpecValue)

  const amount =
    typeof priceSpec?.price === "string" || typeof priceSpec?.price === "number"
      ? Number.parseFloat(String(priceSpec.price))
      : null
  const currency = typeof priceSpec?.priceCurrency === "string" ? priceSpec.priceCurrency : "USD"

  if (!name || amount === null || !Number.isFinite(amount)) return null

  return { name, imageUrl, offer: { amount, currency } }
}

/**
 * Integración real con Thot Computación (WordPress + WooCommerce, tema
 * Porto). Server-rendered, sin JS necesario. robots.txt solo restringe
 * /wp-admin/ (y permite explícitamente admin-ajax.php) — búsqueda y fichas
 * de producto están permitidas.
 */
export class ThotProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "thot-provider",
    storeSlug: STORE_SLUGS.thot,
    displayName: "Thot Computación",
  }

  async fetchProducts(): Promise<Product[]> {
    // Sin fuente de datos propia: no tiene sentido traer el catálogo completo todavía.
    return []
  }

  async fetchPrice(): Promise<Price | null> {
    return null
  }

  async searchProducts(query: string): Promise<StoreSearchHit[]> {
    const searchUrl = (page: number) =>
      page === 1
        ? `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=product`
        : `${BASE_URL}/page/${page}/?s=${encodeURIComponent(query)}&post_type=product`

    const firstHtml = await this.fetchHtml(searchUrl(1))
    if (!firstHtml) return []

    const firstPage = load(firstHtml)
    const hits = this.parseSearchResults(firstPage)
    const lastPage = Math.min(this.findLastPageNumber(firstPage), MAX_SEARCH_PAGES)

    if (lastPage > 1) {
      const extraPages = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, index) => this.fetchHtml(searchUrl(index + 2)))
      )
      for (const html of extraPages) {
        if (!html) continue
        hits.push(...this.parseSearchResults(load(html)))
      }
    }

    return hits
  }

  /** Mayor número de página visible en la paginación de WooCommerce (`.page-numbers`). */
  private findLastPageNumber($: ReturnType<typeof load>): number {
    let lastPage = 1
    $(".page-numbers").each((_, element) => {
      const text = $(element).text().trim()
      const pageNumber = Number.parseInt(text, 10)
      if (Number.isFinite(pageNumber) && pageNumber > lastPage) lastPage = pageNumber
    })
    return lastPage
  }

  private parseSearchResults($: ReturnType<typeof load>): StoreSearchHit[] {
    const hits: StoreSearchHit[] = []

    $("ul.products > li.product").each((_, element) => {
      const item = $(element)
      const link = item.find("a.product-loop-title").first()
      const url = link.attr("href")
      const name = link.find("h3").first().text().trim()
      const priceText = item.find(".price").first().text()

      if (!url || !name) return
      const realSlug = extractSlugFromProductUrl(url)
      const amount = parsePriceAmount(priceText)
      if (!realSlug || amount === null) return

      const image = item.find("img").first()
      const imageUrl = image.attr("data-src") || image.attr("src") || null

      hits.push(
        this.buildHit(realSlug, name, amount, priceText, imageUrl?.startsWith("data:") ? null : imageUrl)
      )
    })

    return hits
  }

  async fetchProductBySlug(slug: string): Promise<StoreSearchHit | null> {
    const realSlug = parseProductSlug(slug)?.realSlug ?? slug
    const html = await this.fetchHtml(`${BASE_URL}/producto/${realSlug}/`)
    if (!html) return null

    const $ = load(html)
    let productNode: Record<string, unknown> | null = null

    $('script[type="application/ld+json"]').each((_, element) => {
      if (productNode) return
      try {
        productNode = findProductNode(JSON.parse($(element).text()))
      } catch {
        // Script mal formado o no-JSON: se ignora y se sigue con el próximo.
      }
    })
    if (!productNode) return null

    const parsed = extractProductDetails(productNode)
    if (!parsed) return null

    return this.buildHit(realSlug, parsed.name, parsed.offer.amount, parsed.offer.currency, parsed.imageUrl)
  }

  private buildHit(
    realSlug: string,
    name: string,
    amount: number,
    currencyHint: string,
    imageUrl: string | null
  ): StoreSearchHit {
    const productId = buildProductSlug(this.metadata.storeSlug, realSlug)
    const currency = normalizeCurrency(currencyHint)

    const product: Product = {
      id: productId,
      slug: productId,
      name,
      brand: null,
      category: "Electrónica",
      imageUrl,
      unit: "",
      sourceUrl: `${BASE_URL}/producto/${realSlug}/`,
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
