"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ProductCard } from "@/components/shared/product-card"
import { useSearchProducts } from "@/features/search/hooks/use-search-products"

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const { data, isLoading, isError } = useSearchProducts(query)

  if (!query.trim()) {
    return (
      <EmptyState
        title="Buscá un producto"
        description="Escribí el nombre de un producto para ver resultados reales de nuestras tiendas."
      />
    )
  }

  if (isLoading) {
    return <LoadingState rows={4} />
  }

  if (isError) {
    return (
      <ErrorState
        title="No pudimos completar la búsqueda"
        description="Intentá de nuevo en unos segundos."
      />
    )
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Sin resultados"
        description={`No encontramos productos para "${query}" en las tiendas disponibles hoy.`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{data.length} resultados</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {data.map((hit) => (
          <ProductCard
            key={hit.product.id}
            slug={hit.product.slug}
            name={hit.product.name}
            brand={hit.product.brand ?? hit.product.category}
            minPrice={hit.price.amount}
            currency={hit.price.currency}
            storeCount={1}
          />
        ))}
      </div>
    </div>
  )
}
