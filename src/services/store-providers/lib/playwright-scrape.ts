import type { Browser, Page } from "playwright-core"

import { API_CONFIG } from "@/shared/constants/api"

/**
 * Lanza el browser real que se usa en producción (`@sparticuz/chromium`,
 * Chromium comprimido apto para funciones serverless de Vercel) solo cuando
 * corre en Vercel (`process.env.VERCEL`). En desarrollo local usa el paquete
 * `playwright` completo (con browsers ya instalados vía
 * `npx playwright install chromium`) — el binario de `@sparticuz/chromium`
 * es específico de Linux y no corre en Windows/Mac. Imports dinámicos para
 * que cada entorno solo cargue lo que realmente necesita.
 */
async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const [{ default: chromium }, { chromium: playwrightChromium }] = await Promise.all([
      import("@sparticuz/chromium"),
      import("playwright-core"),
    ])

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  const { chromium: playwrightChromium } = await import("playwright")
  return playwrightChromium.launch({ headless: true })
}

let browserPromise: Promise<Browser> | null = null

/** Browser singleton de proceso — se reusa entre invocaciones cálidas de la función. */
function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error: unknown) => {
      browserPromise = null
      throw error
    })
  }
  return browserPromise
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(cacheKey: string): T | undefined {
  const entry = cache.get(cacheKey)
  if (!entry) return undefined
  if (entry.expiresAt < Date.now()) {
    cache.delete(cacheKey)
    return undefined
  }
  return entry.value as T
}

function setCached<T>(cacheKey: string, value: T): void {
  cache.set(cacheKey, { value, expiresAt: Date.now() + API_CONFIG.revalidateSeconds * 1000 })
}

/**
 * Corre `run` contra una página nueva de un browser headless compartido,
 * cacheado por `cacheKey` durante `API_CONFIG.revalidateSeconds` (mismo
 * criterio que el `next.revalidate` que usa Thot vía fetch) para no lanzar
 * un browser en cada request. Nunca relanza excepciones — un timeout o un
 * bloqueo de Cloudflare devuelve `null`, igual que un `fetch` fallido, así
 * `Promise.allSettled` en `searchAllProviders` no se ve afectado.
 */
export async function scrapeWithBrowser<T>(
  cacheKey: string,
  run: (page: Page) => Promise<T>
): Promise<T | null> {
  const cached = getCached<T>(cacheKey)
  if (cached !== undefined) return cached

  let page: Page | null = null

  try {
    const browser = await getBrowser()
    page = await browser.newPage({ userAgent: DEFAULT_USER_AGENT })
    page.setDefaultTimeout(API_CONFIG.playwrightTimeoutMs)

    const result = await run(page)
    setCached(cacheKey, result)
    return result
  } catch {
    return null
  } finally {
    await page?.close().catch(() => {})
  }
}

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
