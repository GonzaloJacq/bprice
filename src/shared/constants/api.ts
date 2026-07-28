/**
 * Configuración genérica de la capa de API. No apunta a ningún endpoint real
 * todavía — los repositories la consumirán una vez que existan fuentes de
 * datos reales (scrapers/APIs de cada tienda).
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  /**
   * Con margen para tolerar jitter del event loop cuando corre en paralelo
   * con un provider basado en Playwright (parseo síncrono pesado de cheerio
   * puede demorar la resolución de un `fetch` liviano corriendo a la vez en
   * el mismo proceso) — verificado empíricamente: 10s ocasionalmente
   * abortaba un fetch de Thot que sí hubiera resuelto a tiempo sin esa
   * contención.
   */
  timeoutMs: 20_000,
  /** Segundos por defecto para revalidación de fetch/Server Actions cacheadas. */
  revalidateSeconds: 60 * 15,
  /**
   * Timeout para providers que necesitan un browser headless (Playwright),
   * ej. sitios detrás de un challenge de Cloudflare. Más generoso que
   * `timeoutMs`: resolver el challenge + renderizar tarda más que un fetch
   * plano. Punto de partida sin validar contra el challenge real — ajustar
   * durante la implementación de cada provider.
   */
  playwrightTimeoutMs: 30_000,
} as const
