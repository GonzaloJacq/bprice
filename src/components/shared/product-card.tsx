import Link from "next/link"
import { Package, TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { StoreBadge } from "@/components/shared/store-badge"
import { APP_ROUTES } from "@/shared/constants/routes"
import { cn } from "@/shared/lib/utils"
import { formatCurrency } from "@/shared/utils/format"

interface ProductCardProps {
  slug: string
  name: string
  brand: string
  imageUrl?: string | null
  minPrice: number
  currency: string
  /** Nombre de cada tienda que vende este producto (una `StoreBadge` por tienda, no un conteo). */
  storeNames: string[]
  trend?: "up" | "down"
  discountPercent?: number
  className?: string
}

/** Tope de badges de tienda visibles antes de colapsar el resto en un "+N" — evita que la card crezca sin límite con muchas ofertas. */
const MAX_VISIBLE_STORES = 3

export function ProductCard({
  slug,
  name,
  brand,
  imageUrl,
  minPrice,
  currency,
  storeNames,
  trend,
  discountPercent,
  className,
}: ProductCardProps) {
  const visibleStores = storeNames.slice(0, MAX_VISIBLE_STORES)
  const hiddenStoreCount = storeNames.length - visibleStores.length
  return (
    <Link href={APP_ROUTES.productDetail(slug)} className="block h-full">
      <Card className={cn("h-full transition-colors hover:bg-muted/40", className)}>
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- imágenes de dominios externos, uno por tienda
              <img
                src={imageUrl}
                alt={name}
                loading="lazy"
                className="size-full object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none"
                  event.currentTarget.nextElementSibling?.classList.remove("hidden")
                }}
              />
            ) : null}
            <Package
              className={cn("size-10 text-muted-foreground", imageUrl && "hidden")}
              strokeWidth={1.5}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{brand}</p>
            <p className="text-sm leading-snug font-medium">{name}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visibleStores.map((storeName) => (
              <StoreBadge key={storeName} name={storeName} className="text-[11px]" />
            ))}
            {hiddenStoreCount > 0 ? <Badge variant="secondary">+{hiddenStoreCount}</Badge> : null}
          </div>
        </CardContent>
        <CardFooter className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Desde</span>
            <span className="text-lg font-semibold">
              {formatCurrency(minPrice, currency)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {trend === "down" && discountPercent ? (
              <Badge
                variant="outline"
                className="gap-1 text-emerald-600 dark:text-emerald-400"
              >
                <TrendingDown className="size-3" />
                {discountPercent}%
              </Badge>
            ) : null}
            {trend === "up" ? (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <TrendingUp className="size-3" />
              </Badge>
            ) : null}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
