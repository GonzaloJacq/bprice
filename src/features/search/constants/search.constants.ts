export const SEARCH_QUERY_KEYS = {
  results: (query: string) => ["search", query] as const,
}
