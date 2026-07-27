import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

/**
 * Bloque vertical estándar entre secciones de una página.
 */
export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("py-8 sm:py-12", className)} {...props} />
}
