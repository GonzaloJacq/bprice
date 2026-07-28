import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StoreLogo } from "@/components/shared/store-logo"
import { cn } from "@/shared/lib/utils"
import { formatCurrency, formatDate } from "@/shared/utils/format"

export type PriceTableStock = "in_stock" | "low_stock" | "out_of_stock"

export interface PriceTableRow {
  storeName: string
  price: number
  currency: string
  stock: PriceTableStock
  updatedAt?: string
  storeUrl?: string
  isBestPrice?: boolean
}

interface PriceTableProps {
  rows: PriceTableRow[]
  showUpdatedAt?: boolean
  showAction?: boolean
}

const STOCK_LABEL: Record<PriceTableStock, string> = {
  in_stock: "En stock",
  low_stock: "Stock bajo",
  out_of_stock: "Sin stock",
}

const STOCK_VARIANT: Record<PriceTableStock, "secondary" | "outline" | "destructive"> = {
  in_stock: "secondary",
  low_stock: "outline",
  out_of_stock: "destructive",
}

/**
 * Tabla de precios por tienda. Se reutiliza en Detalle (stock) y en
 * Comparación (columnas completas) vía `showUpdatedAt`/`showAction`.
 */
export function PriceTable({ rows, showUpdatedAt, showAction }: PriceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tienda</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Stock</TableHead>
          {showUpdatedAt ? <TableHead>Última actualización</TableHead> : null}
          {showAction ? <TableHead className="text-right">Acción</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.storeName}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <StoreLogo name={row.storeName} size="sm" />
                {row.storeName}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {formatCurrency(row.price, row.currency)}
                {row.isBestPrice ? <Badge variant="secondary">Mejor precio</Badge> : null}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={STOCK_VARIANT[row.stock]}>{STOCK_LABEL[row.stock]}</Badge>
            </TableCell>
            {showUpdatedAt ? (
              <TableCell className="text-muted-foreground">
                {row.updatedAt ? formatDate(row.updatedAt) : "—"}
              </TableCell>
            ) : null}
            {showAction ? (
              <TableCell className="text-right">
                {row.storeUrl ? (
                  <a
                    href={row.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                  >
                    Ir a tienda
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
