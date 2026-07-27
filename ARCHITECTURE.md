# Arquitectura

Este proyecto usa **Feature-Based Architecture**. Esta guía es la fuente de
verdad sobre cómo está organizado el código y qué reglas nunca se rompen.

## Flujo de datos obligatorio

Toda operación de lectura o escritura sigue siempre este camino, en este orden:

```
constants → Repository → Server Action ("use server") → TanStack Query Hook → Componentes
```

- **constants**: valores fijos de la feature (query keys, cache tags, límites).
- **Repository**: única capa que sabe de dónde vienen los datos (hoy: providers
  stub en `src/services/store-providers`; mañana: DB, API propia, etc.). Nada
  fuera del repository debe saber cómo se obtienen los datos.
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
hooks/          Hooks genéricos no ligados a ninguna feature (ej. use-mounted).
providers/      Providers de React de la app (QueryProvider, ThemeProvider).
                No confundir con los "store providers" de services/.
repositories/   Contrato base (`Repository<T, TId>`) que implementan los
                repositories de cada feature.
services/
  store-providers/   Integraciones por tienda (Banifox, Loi, Thot,
                      Carlos Gutiérrez, Tienda Inglesa), todas implementando
                      la interfaz `StoreProvider`. Hoy son stubs sin lógica
                      real ni llamadas reales.
shared/
  constants/    api.ts, routes.ts, stores.ts, config.ts — constantes globales.
  types/        Interfaces de dominio: Store, Product, Price, PriceHistory,
                SearchResult, Provider/StoreProvider.
  lib/          cn(), query-client (factory de QueryClient), metadata
                (helper de SEO/Metadata API).
  utils/        Funciones puras (formateo de moneda, fechas, etc.).
```

## Anatomía de una feature

`features/stores/` es la feature de referencia — cablea el flujo completo
(sin UI todavía) y es la plantilla exacta a copiar para `products`, `prices`
o `search`:

```
features/stores/
  constants/
    stores.constants.ts       # Query keys de TanStack Query
  repositories/
    store.repository.ts       # Implementa Repository<Store>, delega en
                               # services/store-providers
  actions/
    get-stores.action.ts        # "use server"
    get-store-by-slug.action.ts
  hooks/
    use-stores.ts              # useQuery
    use-store.ts
  components/                  # (no existe aún — acá va la UI de la feature
                                #  cuando se implemente, consumiendo solo los
                                #  hooks de arriba)
```

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

## Estado actual

Todo el código de esta primera pasada es **arquitectura pura**: interfaces,
constants y stubs sin lógica real, sin scraping, sin llamadas reales, sin
pantallas de feature. El objetivo es tener una base estable que no necesite
reestructurarse a medida que se implementen features reales.
