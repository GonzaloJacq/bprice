"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PriceTable, type PriceTableRow } from "@/components/shared/price-table"
import { useProductOffers } from "@/features/products/hooks/use-product-offers"
import { parseProductSlug } from "@/shared/utils/product-slug"
import { resolveStoreName } from "@/shared/utils/store"

interface ProductCompareProps {
  slug: string
}

export function ProductCompare({ slug }: ProductCompareProps) {
  const { data, isLoading, isError } = useProductOffers(slug)

  if (isLoading) {
    return <LoadingState rows={3} />
  }

  if (isError) {
    return (
      <ErrorState
        title="No pudimos cargar la comparación"
        description="Intentá de nuevo en unos segundos."
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="Producto no encontrado"
        description="Puede que ya no esté disponible en la tienda de origen."
      />
    )
  }

  const rows: PriceTableRow[] = data.offers.map(({ product, price }, index) => ({
    storeName: resolveStoreName(parseProductSlug(product.slug)?.storeSlug),
    price: price.amount,
    currency: price.currency,
    stock: "in_stock",
    updatedAt: price.capturedAt,
    storeUrl: product.sourceUrl ?? undefined,
    isBestPrice: index === 0,
  }))

  return <PriceTable rows={rows} showUpdatedAt showAction />
}
