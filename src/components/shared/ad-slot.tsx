import { APP_CONFIG } from "@/shared/constants/config"
import { cn } from "@/shared/lib/utils"

interface AdSlotProps {
  slot: keyof typeof APP_CONFIG.ads.slots
  className?: string
}

/**
 * Placeholder de espacio publicitario. Sin red de anuncios integrada
 * todavía — hoy solo reserva el layout para cuando se conecte una.
 */
export function AdSlot({ slot, className }: AdSlotProps) {
  if (!APP_CONFIG.ads.enabled) {
    return null
  }

  return (
    <div
      data-ad-slot={APP_CONFIG.ads.slots[slot]}
      className={cn(
        "border-border text-muted-foreground flex items-center justify-center rounded-md border border-dashed text-xs",
        className
      )}
    >
      Ad slot: {slot}
    </div>
  )
}
