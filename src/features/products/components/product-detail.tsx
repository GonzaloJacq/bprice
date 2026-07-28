"use client"

import { Bell, Package } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PriceCard } from "@/components/shared/price-card"
import { PriceTable, type PriceTableRow } from "@/components/shared/price-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProductOffers } from "@/features/products/hooks/use-product-offers"
import { cn } from "@/shared/lib/utils"
import { parseProductSlug } from "@/shared/utils/product-slug"
import { resolveStoreName } from "@/shared/utils/store"

interface ProductDetailProps {
  slug: string
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const { data, isLoading, isError } = useProductOffers(slug)

  if (isLoading) {
    return <LoadingState rows={4} />
  }

  if (isError) {
    return (
      <ErrorState
        title="No pudimos cargar este producto"
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

  const cheapest = data.offers[0]
  const storeCount = data.offers.length

  const rows: PriceTableRow[] = data.offers.map(({ product, price }, index) => ({
    storeName: resolveStoreName(parseProductSlug(product.slug)?.storeSlug),
    price: price.amount,
    currency: price.currency,
    stock: "in_stock",
    updatedAt: price.capturedAt,
    storeUrl: product.sourceUrl ?? undefined,
    isBestPrice: index === 0,
  }))

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- imágenes de dominios externos, uno por tienda
            <img
              src={data.imageUrl}
              alt={data.name}
              className="size-full object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none"
                event.currentTarget.nextElementSibling?.classList.remove("hidden")
              }}
            />
          ) : null}
          <Package
            className={cn("size-24 text-muted-foreground", data.imageUrl && "hidden")}
            strokeWidth={1}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {data.category} · {storeCount} {storeCount === 1 ? "tienda" : "tiendas"}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
          </div>

          <PriceCard
            label={storeCount > 1 ? "Mejor precio" : "Precio"}
            amount={cheapest.price.amount}
            currency={cheapest.price.currency}
            emphasis
          />

          <Dialog>
            <DialogTrigger render={<Button className="w-fit gap-2" />}>
              <Bell className="size-4" />
              Crear Alerta
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear alerta de precio</DialogTitle>
                <DialogDescription>
                  Te avisamos por email cuando {data.name} baje de precio.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="alert-email">Email</Label>
                <Input id="alert-email" type="email" placeholder="tu@email.com" />
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                <Button>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Precio por tienda</h2>
        <PriceTable rows={rows} showUpdatedAt showAction />
      </div>
    </div>
  )
}
