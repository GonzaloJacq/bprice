/**
 * Configuración global de la aplicación: metadata por defecto, paginación,
 * feature flags y el placeholder de publicidad. Todo sin funcionalidad real
 * todavía — se activa a medida que se implementen las features.
 */
export const APP_CONFIG = {
  siteName: "BPrice",
  siteDescription: "Comparador de precios",
  defaultLocale: "es-UY",
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  features: {
    priceHistoryEnabled: false,
  },
  ads: {
    enabled: false,
    slots: {
      header: "header-slot",
      sidebar: "sidebar-slot",
      inline: "inline-slot",
    },
  },
} as const
