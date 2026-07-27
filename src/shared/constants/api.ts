/**
 * Configuración genérica de la capa de API. No apunta a ningún endpoint real
 * todavía — los repositories la consumirán una vez que existan fuentes de
 * datos reales (scrapers/APIs de cada tienda).
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  timeoutMs: 10_000,
  /** Segundos por defecto para revalidación de fetch/Server Actions cacheadas. */
  revalidateSeconds: 60 * 15,
} as const
