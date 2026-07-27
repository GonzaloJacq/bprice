"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PriceTable } from "@/components/shared/price-table"
import { useProduct } from "@/features/products/hooks/use-product"
import { SUPPORTED_STORES } from "@/shared/constants/stores"
import { parseProductSlug } from "@/shared/utils/product-slug"

interface ProductCompareProps {
  slug: string
}

/**
 * Hoy siempre muestra una sola fila (la única tienda con integración real
 * es Thot Computación) — es correcto y esperado, no se fuerza a simular
 * más tiendas.
 */
export function ProductCompare({ slug }: ProductCompareProps) {
  const { data, isLoading, isError } = useProduct(slug)

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

  const { product, price } = data
  const storeSlug = parseProductSlug(product.slug)?.storeSlug
  const storeName = SUPPORTED_STORES.find((store) => store.slug === storeSlug)?.name ?? "Tienda"

  return (
    <PriceTable
      rows={[
        {
          storeName,
          price: price.amount,
          currency: price.currency,
          stock: "in_stock",
          updatedAt: price.capturedAt,
          storeUrl: product.sourceUrl ?? undefined,
        },
      ]}
      showUpdatedAt
      showAction
    />
  )
}
