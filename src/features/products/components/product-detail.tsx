"use client"

import { Bell, Package } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PriceCard } from "@/components/shared/price-card"
import { PriceTable } from "@/components/shared/price-table"
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
import { useProduct } from "@/features/products/hooks/use-product"
import { SUPPORTED_STORES } from "@/shared/constants/stores"
import { parseProductSlug } from "@/shared/utils/product-slug"

interface ProductDetailProps {
  slug: string
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const { data, isLoading, isError } = useProduct(slug)

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

  const { product, price } = data
  const storeSlug = parseProductSlug(product.slug)?.storeSlug
  const storeName = SUPPORTED_STORES.find((store) => store.slug === storeSlug)?.name ?? "Tienda"

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-xl bg-muted">
          <Package className="size-24 text-muted-foreground" strokeWidth={1} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {product.category} · {storeName}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          </div>

          <PriceCard label="Precio" amount={price.amount} currency={price.currency} emphasis />

          <Dialog>
            <DialogTrigger render={<Button className="w-fit gap-2" />}>
              <Bell className="size-4" />
              Crear Alerta
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear alerta de precio</DialogTitle>
                <DialogDescription>
                  Te avisamos por email cuando {product.name} baje de precio.
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
        <PriceTable
          rows={[
            {
              storeName,
              price: price.amount,
              currency: price.currency,
              stock: "in_stock",
            },
          ]}
        />
      </div>
    </div>
  )
}
