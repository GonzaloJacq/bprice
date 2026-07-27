import { Megaphone } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/shared/lib/utils"

interface AdBannerProps {
  variant?: "horizontal" | "square"
  className?: string
}

/**
 * Placeholder de espacio publicitario para la UI. Distinto de `AdSlot`
 * (src/components/shared/ad-slot.tsx), que depende de `APP_CONFIG.ads` —
 * este componente es puramente visual, sin lógica de configuración.
 */
export function AdBanner({ variant = "horizontal", className }: AdBannerProps) {
  return (
    <Card
      className={cn(
        "items-center justify-center border-dashed bg-muted/30 py-10",
        variant === "square" && "aspect-square py-0",
        className
      )}
    >
      <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
        <Megaphone className="size-5" strokeWidth={1.5} />
        <span className="text-xs">Espacio publicitario</span>
      </CardContent>
    </Card>
  )
}
