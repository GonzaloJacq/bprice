import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/shared/lib/utils"
import { formatCurrency } from "@/shared/utils/format"

interface PriceCardProps {
  label: string
  amount: number
  currency: string
  emphasis?: boolean
  className?: string
}

/**
 * Tarjeta simple de un solo dato numérico (precio mínimo, promedio, etc.).
 */
export function PriceCard({ label, amount, currency, emphasis, className }: PriceCardProps) {
  return (
    <Card className={cn(emphasis && "ring-primary/40 bg-primary/5", className)}>
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tracking-tight">
          {formatCurrency(amount, currency)}
        </span>
      </CardContent>
    </Card>
  )
}
