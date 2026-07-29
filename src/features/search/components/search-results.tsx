"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { FilterSidebar } from "@/components/shared/filter-sidebar"
import { LoadingState } from "@/components/shared/loading-state"
import { ProductCard } from "@/components/shared/product-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSearchProducts } from "@/features/search/hooks/use-search-products"
import type { MatchedProduct } from "@/shared/types"
import { formatCurrency } from "@/shared/utils/format"
import { parseProductSlug } from "@/shared/utils/product-slug"
import { resolveStoreName } from "@/shared/utils/store"

interface SearchResultsProps {
  query: string
}

type SortOrder = "relevancia" | "precio-asc" | "precio-desc"

/** Slugs de tienda (namespace del slug de producto) de cada oferta de un producto matcheado. */
function storeSlugsOf(matched: MatchedProduct): string[] {
  return matched.offers
    .map((offer) => parseProductSlug(offer.product.slug)?.storeSlug)
    .filter((slug): slug is string => Boolean(slug))
}

export function SearchResults({ query }: SearchResultsProps) {
  const { data, isLoading, isError } = useSearchProducts(query)
  /**
   * Multiselect por tienda, modelado como exclusión: por defecto ninguna
   * tienda está excluida (todas incluidas/tildadas), y destildar una tienda
   * puntual la agrega acá. Evita tener que sincronizar un set de "incluidas"
   * con `availableStores` cada vez que cambian los resultados (llegan async).
   */
  const [excludedStores, setExcludedStores] = useState<ReadonlySet<string>>(new Set())
  const [priceLimit, setPriceLimit] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("relevancia")

  const availableStores = useMemo(() => {
    const byName = new Map<string, string>()
    for (const matched of data ?? []) {
      for (const slug of storeSlugsOf(matched)) {
        if (!byName.has(slug)) byName.set(slug, resolveStoreName(slug))
      }
    }
    return Array.from(byName, ([slug, name]) => ({ slug, name }))
  }, [data])

  const includedStoreSlugs = useMemo(
    () => new Set(availableStores.map((store) => store.slug).filter((slug) => !excludedStores.has(slug))),
    [availableStores, excludedStores]
  )

  /**
   * Máximo entre los precios "desde" de los productos matcheados. Mezcla
   * monedas si la búsqueda trae ofertas en USD y UYU a la vez — sin tasa de
   * cambio no hay forma correcta de unificarlas (misma decisión que
   * `product-matcher.ts`), así que el filtro de precio queda como un rango
   * numérico aproximado en ese caso, no una moneda real.
   */
  const priceMax = useMemo(() => {
    if (!data || data.length === 0) return 0
    return Math.max(...data.map((matched) => matched.offers[0].price.amount))
  }, [data])

  const singleCurrency = useMemo(() => {
    const currencies = new Set((data ?? []).map((matched) => matched.offers[0].price.currency))
    return currencies.size === 1 ? [...currencies][0] : null
  }, [data])

  const effectivePriceLimit = priceLimit ?? priceMax
  const priceLimitLabel = singleCurrency
    ? formatCurrency(effectivePriceLimit, singleCurrency)
    : `${effectivePriceLimit}+`

  const filteredData = useMemo(() => {
    const filtered = (data ?? []).filter((matched) => {
      const matchesStore = storeSlugsOf(matched).some((slug) => !excludedStores.has(slug))
      const matchesPrice = matched.offers[0].price.amount <= effectivePriceLimit
      return matchesStore && matchesPrice
    })

    if (sortOrder === "relevancia") return filtered

    // Mismo criterio que el filtro de precio: ordena por monto numérico "desde",
    // sin normalizar entre monedas si la búsqueda mezcla USD y UYU.
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      const diff = a.offers[0].price.amount - b.offers[0].price.amount
      return sortOrder === "precio-asc" ? diff : -diff
    })
    return sorted
  }, [data, excludedStores, effectivePriceLimit, sortOrder])

  function toggleStore(slug: string) {
    setExcludedStores((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  if (!query.trim()) {
    return (
      <EmptyState
        title="Buscá un producto"
        description="Escribí el nombre de un producto para ver resultados reales de nuestras tiendas."
      />
    )
  }

  const filters = (
    <FilterSidebar
      stores={availableStores}
      selectedStoreSlugs={includedStoreSlugs}
      onToggleStore={toggleStore}
      priceMax={priceMax}
      priceLimit={effectivePriceLimit}
      priceLimitLabel={priceLimitLabel}
      onPriceLimitChange={setPriceLimit}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" size="sm" className="gap-2 lg:hidden" />}
          >
            <SlidersHorizontal className="size-4" />
            Filtros
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="px-4">{filters}</div>
          </SheetContent>
        </Sheet>

        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as SortOrder)}
        >
          <SelectTrigger className="ml-auto w-[200px]">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevancia">Relevancia</SelectItem>
            <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">{filters}</div>

        {isLoading ? (
          <LoadingState rows={4} />
        ) : isError ? (
          <ErrorState
            title="No pudimos completar la búsqueda"
            description="Intentá de nuevo en unos segundos."
          />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description={`No encontramos productos para "${query}" en las tiendas disponibles hoy.`}
          />
        ) : filteredData.length === 0 ? (
          <EmptyState
            title="Ningún resultado con estos filtros"
            description="Probá sacar algún filtro de tienda o subir el límite de precio."
          />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{filteredData.length} resultados</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {filteredData.map((matched) => {
                const cheapest = matched.offers[0]
                const storeNames = matched.offers.map((offer) =>
                  resolveStoreName(parseProductSlug(offer.product.slug)?.storeSlug)
                )
                return (
                  <ProductCard
                    key={matched.id}
                    slug={cheapest.product.slug}
                    name={matched.name}
                    brand={matched.brand ?? matched.category}
                    imageUrl={matched.imageUrl}
                    minPrice={cheapest.price.amount}
                    currency={cheapest.price.currency}
                    storeNames={storeNames}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
