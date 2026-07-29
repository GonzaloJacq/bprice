import { load } from "cheerio"

import { scrapeWithBrowser } from "@/services/store-providers/lib/playwright-scrape"
import { STORE_SLUGS } from "@/shared/constants/stores"
import type { Price, Product, Provider, StoreProvider, StoreSearchHit } from "@/shared/types"
import { buildProductSlug, parseProductSlug } from "@/shared/utils/product-slug"

const BASE_URL = "https://www.banifox.com"

/**
 * Banifox no arma su grid de resultados con el challenge JS de Cloudflare
 * bloqueando el render — un browser real (Playwright) pasa sin problema. Sin
 * embargo, cada búsqueda cuesta un browser real, no un `fetch` liviano, así
 * que paginamos mucho menos agresivo que Thot.
 */
const MAX_SEARCH_PAGES = 3

/**
 * Las URLs de producto son `<slug-de-nombre-cualquiera>/art-<id>/` — el sitio
 * ignora el primer segmento (confirmado empíricamente, `/x/art-17557/` sirve
 * el mismo producto que la URL "linda"). Usamos solo `art-<id>` como slug
 * real (namespaced) para no meter `/` en nuestras propias rutas de Next.js
 * (`/products/[slug]` es un segmento único) y reconstruimos con un prefijo
 * placeholder al volver a pedir la ficha.
 */
function extractArtSlugFromHref(href: string): string | null {
  const match = /\/(art-\d+)\/?(?:[?#]|$)/.exec(href)
  return match ? match[1] : null
}

function buildDetailUrl(artSlug: string): string {
  return `${BASE_URL}/p/${artSlug}/`
}

/**
 * Clave de cache insensible al orden/capitalización de las palabras de la
 * query: `findOffersBySlug` (ver `product.repository.ts`) vuelve a buscar en
 * todas las tiendas con una query derivada del nombre del producto ancla,
 * que casi siempre comparte las mismas palabras que la búsqueda original del
 * listado pero no necesariamente en el mismo orden/caso ("Teclado Logitech
 * K270" vs "logitech k270"). Sin esto, esa re-búsqueda sería un cache-miss
 * seguro y dispararía un scrape de Playwright nuevo contra un sitio con
 * challenge de Cloudflare — no siempre confiable request a request. Con
 * tokens normalizados, si comparten las mismas palabras reusan el resultado
 * ya scrapeado (y ya probado que funciona) en vez de arriesgar uno nuevo.
 */
function normalizeSearchCacheKey(query: string): string {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ")
}

/** "103,00" / "1.234,56" (convención es-UY: punto de miles, coma decimal) → 103 / 1234.56 */
function parsePriceAmount(text: string): number | null {
  const cleaned = text
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
  const amount = Number.parseFloat(cleaned)
  return Number.isFinite(amount) ? amount : null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null
}

interface ParsedProductLd {
  name: string
  imageUrl: string | null
  amount: number
  currency: string
  /**
   * En el listado de búsqueda, el `url` del JSON-LD apunta a la propia
   * página de búsqueda (no sirve) — ahí se usa el href real del `<a>` de la
   * card. En la ficha de producto sí es la URL canónica real, y se prefiere
   * sobre el placeholder `/p/art-<id>/` usado solo para volver a pedirla.
   */
  canonicalUrl: string | null
}

/** Cada ficha/card trae un único `<script type="application/ld+json">` `{"@type":"Product",...}`. */
function parseProductLd(node: unknown): ParsedProductLd | null {
  const record = asRecord(node)
  if (!record || record["@type"] !== "Product") return null

  const rawName = typeof record.name === "string" ? record.name : null
  const imageUrl = typeof record.image === "string" ? record.image : null
  const canonicalUrl = typeof record.url === "string" ? record.url : null
  const offer = asRecord(record.offers)
  const priceText = typeof offer?.price === "string" ? offer.price : null
  const currency = typeof offer?.priceCurrency === "string" ? offer.priceCurrency : "USD"

  if (!rawName || !priceText) return null
  const amount = parsePriceAmount(priceText)
  if (amount === null) return null

  // La ficha individual sufija " - Banifox" al name; el listado no. Se
  // normaliza acá para que el matcher compare nombres consistentes.
  const name = rawName.replace(/\s*-\s*Banifox\s*$/i, "").trim()

  return { name, imageUrl, amount, currency, canonicalUrl }
}

/** Busca el primer `<script type="application/ld+json">` de tipo Product dentro de `context` (o de todo el documento si se omite). */
function findFirstProductLd(
  $: ReturnType<typeof load>,
  context?: Parameters<ReturnType<typeof load>>[1]
): ParsedProductLd | null {
  let found: ParsedProductLd | null = null

  $('script[type="application/ld+json"]', context).each((_, script) => {
    if (found) return
    try {
      found = parseProductLd(JSON.parse($(script).text()))
    } catch {
      // Script mal formado: se ignora y se sigue con el próximo.
    }
  })

  return found
}

/**
 * Integración real con Banifox (plataforma PHP a medida, detrás de
 * Cloudflare). El challenge no bloquea un browser real — Playwright renderiza
 * el grid de resultados sin intervención manual. Cada card trae su propio
 * JSON-LD (`schema.org/Product`), igual que Thot, así que el parseo es
 * declarativo sobre `page.content()` con cheerio en vez de leer clases CSS.
 */
export class BanifoxProvider implements StoreProvider {
  readonly metadata: Provider = {
    id: "banifox-provider",
    storeSlug: STORE_SLUGS.banifox,
    displayName: "Banifox",
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

    const cacheKey = `banifox:search:${normalizeSearchCacheKey(trimmedQuery)}`

    const hits = await scrapeWithBrowser(cacheKey, async (page) => {
      const allHits: StoreSearchHit[] = []

      for (let pageNumber = 1; pageNumber <= MAX_SEARCH_PAGES; pageNumber++) {
        const url = `${BASE_URL}/buscar?clave=${encodeURIComponent(trimmedQuery)}&pag=${pageNumber}`
        await page.goto(url, { waitUntil: "domcontentloaded" })
        await page
          .waitForSelector(".listados__productos--item", { timeout: 8_000 })
          .catch(() => {})

        const $ = load(await page.content())
        const pageHits = this.parseSearchResults($)
        if (pageHits.length === 0) break

        allHits.push(...pageHits)
        if ($('a[aria-label="Siguiente"]').length === 0) break
      }

      return allHits
    })

    return hits ?? []
  }

  private parseSearchResults($: ReturnType<typeof load>): StoreSearchHit[] {
    const hits: StoreSearchHit[] = []

    $(".listados__productos--item").each((_, element) => {
      const item = $(element)

      const parsed = findFirstProductLd($, element)
      if (!parsed) return

      const href = item.find("figure.centrar_img a[href]").first().attr("href")
      const artSlug = href ? extractArtSlugFromHref(href) : null
      if (!artSlug) return

      hits.push(this.buildHit(artSlug, parsed, href ?? buildDetailUrl(artSlug)))
    })

    return hits
  }

  async fetchProductBySlug(slug: string): Promise<StoreSearchHit | null> {
    const artSlug = parseProductSlug(slug)?.realSlug
    if (!artSlug) return null

    const cacheKey = `banifox:product:${artSlug}`
    const detailUrl = buildDetailUrl(artSlug)

    const hit = await scrapeWithBrowser(cacheKey, async (page) => {
      await page.goto(detailUrl, { waitUntil: "domcontentloaded" })

      const $ = load(await page.content())
      const parsed = findFirstProductLd($)
      if (!parsed) return null

      return this.buildHit(artSlug, parsed, parsed.canonicalUrl ?? detailUrl)
    })

    return hit ?? null
  }

  private buildHit(artSlug: string, parsed: ParsedProductLd, sourceUrl: string): StoreSearchHit {
    const productId = buildProductSlug(this.metadata.storeSlug, artSlug)

    const product: Product = {
      id: productId,
      slug: productId,
      name: parsed.name,
      brand: null,
      category: "Electrónica",
      imageUrl: parsed.imageUrl,
      unit: "",
      sourceUrl,
    }

    const price: Price = {
      id: `${productId}-price`,
      productId,
      storeId: this.metadata.id,
      amount: parsed.amount,
      currency: parsed.currency,
      capturedAt: new Date().toISOString(),
    }

    return { product, price }
  }
}
