/**
 * Rutas de la aplicación. Se definen antes de que existan las pantallas
 * correspondientes para que constants/, actions/ y componentes las
 * referencien de forma consistente desde el día uno.
 */
export const APP_ROUTES = {
  home: "/",
  stores: "/stores",
  storeDetail: (slug: string) => `/stores/${slug}`,
  products: "/products",
  productDetail: (slug: string) => `/products/${slug}`,
  productCompare: (slug: string) => `/products/${slug}/compare`,
  productHistory: (slug: string) => `/products/${slug}/history`,
  search: "/search",
} as const
