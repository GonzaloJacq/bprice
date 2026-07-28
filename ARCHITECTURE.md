# Arquitectura

Este proyecto usa **Feature-Based Architecture**. Esta guía es la fuente de
verdad sobre cómo está organizado el código y qué reglas nunca se rompen.

## Flujo de datos obligatorio

Toda operación de lectura o escritura sigue siempre este camino, en este orden:

```
constants → Repository → Server Action ("use server") → TanStack Query Hook → Componentes
```

- **constants**: valores fijos de la feature (query keys, cache tags, límites).
- **Repository**: única capa que sabe de dónde vienen los datos (hoy:
  providers en `src/services/store-providers` — algunos reales, la mayoría
  todavía stub; mañana: DB propia, etc.). Nada fuera del repository debe
  saber cómo se obtienen los datos.
- **Server Action**: `"use server"`, es la única forma en que un componente
  cliente dispara una operación de servidor. Llama al repository, nunca al
  revés.
- **TanStack Query Hook**: envuelve la Server Action con `useQuery`/
  `useMutation`, usando las query keys definidas en `constants`.
- **Componentes**: consumen el hook. Nunca importan el repository, la action,
  ni un provider directamente.

Ningún archivo debe saltarse una capa (por ejemplo: un componente llamando a
un repository directo, o un hook llamando a un provider sin pasar por la
action).

> **Nota (Next.js 16):** el cliente despacha las Server Actions de a una por
> vez; si una vista dispara varias en simultáneo (varios hooks de TanStack
> Query montados a la vez), se ejecutan en serie, no en paralelo. Para cargas
> que sí necesitan paralelismo real, resolverlo dentro de una única action o
> vía un Route Handler en lugar de disparar varias actions desde el cliente.

## Estructura de `src/`

```
app/            Rutas de Next.js (App Router): layouts, pages, metadata.
actions/        Server Actions realmente globales/cross-feature (raras).
components/
  ui/           Primitivos de shadcn/ui, generados por su CLI. No se reinventan.
  shared/       Wrappers compuestos reutilizables sobre esos primitivos
                (EmptyState, LoadingState, ErrorState, SearchInput, Pagination,
                Section, Container, Logo, ThemeToggle, AdSlot).
  layout/       Header, Footer.
features/       Un directorio por dominio (ver "Anatomía de una feature").
                stores, search, products.
hooks/          Hooks genéricos no ligados a ninguna feature (ej. use-mounted).
providers/      Providers de React de la app (QueryProvider, ThemeProvider).
                No confundir con los "store providers" de services/.
repositories/   Contrato base (`Repository<T, TId>`) que implementan los
                repositories de cada feature.
services/
  store-providers/   Integraciones por tienda (Banifox, Loi, Thot
                      Computación, Carlos Gutiérrez, Tienda Inglesa,
                      Tiendamia), todas implementando `StoreProvider`.
                      Estado real por tienda:
                      ver comentario al inicio de cada archivo — hoy solo
                      Thot Computación tiene scraping real (WooCommerce,
                      HTML + JSON-LD); el resto documenta por qué sigue
                      stub (Cloudflare, SPA sin API localizada, GeneXus,
                      restricción de robots.txt).
shared/
  constants/    api.ts, routes.ts, stores.ts, config.ts — constantes globales.
  types/        Interfaces de dominio: Store, Product, Price, PriceHistory,
                SearchResult, Provider/StoreProvider/StoreSearchHit.
  lib/          cn(), query-client (factory de QueryClient), metadata
                (helper de SEO/Metadata API).
  utils/        Funciones puras (formateo de moneda, fechas, slugs de
                producto namespaced por tienda, etc.).
```

## Anatomía de una feature

`features/stores/` fue la feature de referencia original. `features/search`
y `features/products` siguen exactamente el mismo patrón, ya con datos
reales:

```
features/search/
  constants/search.constants.ts     # Query keys
  repositories/search.repository.ts # Promise.allSettled sobre STORE_PROVIDERS
  actions/search-products.action.ts # "use server"
  hooks/use-search-products.ts      # useQuery
  components/search-results.tsx     # Consume el hook; loading/empty/error
                                     # con EmptyState/ErrorState/LoadingState

features/products/
  constants/products.constants.ts
  repositories/product.repository.ts # Parsea el prefijo de tienda del slug
                                      # y delega en STORE_PROVIDERS[slug]
  actions/get-product.action.ts
  hooks/use-product.ts, use-product-offers.ts
  components/
    product-detail.tsx    # Detalle (siempre la tienda ancla del slug)
    product-compare.tsx   # Comparación real entre tiendas (ver "Matching
                           # de productos" más abajo)
```

Los slugs de producto son namespaced por tienda (`<storeSlug>__<slugReal>`,
ver `shared/utils/product-slug.ts`) para no colisionar cuando se sumen más
integraciones reales.

Para agregar una feature nueva: copiar esta estructura de carpetas, nunca
saltar capas, y reusar los tipos de `shared/types` en vez de duplicarlos.

## Theming, SEO y publicidad

- **Dark mode**: `next-themes` vía `providers/theme-provider.tsx`. El toggle
  vive en `components/shared/theme-toggle.tsx` y usa `hooks/use-mounted.ts`
  para evitar mismatches de hidratación.
- **SEO/Metadata**: `shared/lib/metadata.ts` expone `buildMetadata()`,
  consumido por `app/layout.tsx`. Los valores por defecto están en
  `shared/constants/config.ts`.
- **Publicidad**: `components/shared/ad-slot.tsx` es un placeholder sin red
  de anuncios integrada. Se activa cambiando `APP_CONFIG.ads.enabled` en
  `shared/constants/config.ts` una vez que haya un proveedor real.

## Matching de productos entre tiendas

No hay GTIN/SKU compartido entre estas tiendas uruguayas, así que "el mismo
producto en dos tiendas" se resuelve con una heurística de nombre, no con un
identificador exacto: `shared/utils/product-matcher.ts` (`matchProducts`)
normaliza y tokeniza nombres, y agrupa por similitud de Jaccard con gates que
nunca deben violarse (misma moneda, nunca dos ofertas de la misma tienda,
marcas no en conflicto, ni un accesorio con su producto "padre" — ej.
"Reposamuñeca para Teclado X" nunca matchea con "Teclado X").

- `features/search/actions/search-products.action.ts` aplica el matcher
  sobre los hits de `searchAllProviders` y devuelve `MatchedProduct[]`.
- `features/products/repositories/product.repository.ts::findOffersBySlug`
  + `actions/get-product-offers.action.ts` lo reaplican para armar la
  comparación de un producto puntual (sin catálogo propio, re-buscando por
  su nombre — ver limitaciones en el comentario de `findOffersBySlug`).

Es un heurístico, no un match exacto: puede haber falsos positivos (dos
variantes distintas de un mismo modelo/marca con nombres muy parecidos,
ej. dos soportes Brateck de capacidad distinta) y falsos negativos (mismo
producto con fraseo muy distinto entre tiendas). Documentado en el propio
archivo — no se trata de silenciar el problema sino de una decisión de
producto consciente dado que no hay una fuente de identificadores exacta.

## Estado actual

- **Búsqueda y comparación real multi-tienda** para Thot Computación
  (`thot.provider.ts`, WooCommerce, `fetch` + `cheerio`), Banifox
  (`banifox.provider.ts`, detrás de Cloudflare — requiere browser headless,
  ver `services/store-providers/lib/playwright-scrape.ts`) y Carlos
  Gutiérrez (`carlos-gutierrez.provider.ts`, API JSON propia con CORS
  abierto, `fetch` simple). Las tres devuelven `StoreSearchHit[]` reales que
  el matcher agrupa entre sí.
- **Loi, Tienda Inglesa y Tiendamia quedan stub deliberadamente**, no por
  falta de tiempo — cada archivo documenta el bloqueo real:
  - Tienda Inglesa: su `robots.txt` prohíbe explícitamente crawlear su
    buscador (`/busqueda`); solo categorías/listados están permitidos, lo
    que requeriría un catálogo indexado (DB + cron) que no existe hoy.
  - Tiendamia: su `robots.txt` prohíbe *todo* endpoint de datos (listados,
    fichas, API) para cualquier user-agent. No hay vía respetuosa hoy.
  - Loi: su propia API interna (`?ctrl=X&act=Y`, la única fuente de datos
    de toda la SPA) está explícitamente Disallow para cualquier crawler
    estándar en su `robots.txt`. Ese mismo `robots.txt` además intenta
    manipular agentes de IA con secciones falsas de "acceso total" y
    archivos de "descubrimiento para IA" inexistentes como convención real
    — se ignora por completo, nunca se trata como instrucción ni como
    permiso válido.
- **Playwright para providers detrás de challenges JS** (hoy: Banifox): un
  helper compartido (`scrapeWithBrowser`) mantiene un browser singleton de
  proceso + cache in-memory con TTL, para no lanzar un browser nuevo en
  cada búsqueda. En Vercel usa `playwright-core` + `@sparticuz/chromium`
  (`process.env.VERCEL`); en desarrollo local usa el paquete `playwright`
  completo (con browsers instalados vía `npx playwright install chromium`).
- No hay catálogo propio ni base de datos: cada búsqueda golpea a los
  providers en vivo. Por eso Home no tiene "productos populares" fijos, y
  la página de Historial muestra un estado vacío honesto en vez de datos
  inventados — una serie de precios en el tiempo requeriría una capa de
  persistencia (DB + scraping periódico) que todavía no existe.
- Nada de esto rompe el flujo `constants → Repository → Server Action →
  Hook → Componentes`: rellenar un stub con lógica real, o sumar una
  feature nueva siguiendo el mismo patrón, es exactamente para lo que está
  pensada esta arquitectura.
