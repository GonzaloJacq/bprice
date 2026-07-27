/**
 * Query keys de TanStack Query para la feature stores. Centralizadas acá
 * para que hooks e invalidaciones futuras (ej. tras una mutation) usen
 * siempre la misma forma de key.
 */
export const STORES_QUERY_KEYS = {
  all: ["stores"] as const,
  detail: (slug: string) => ["stores", slug] as const,
}
