import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

/**
 * Wrapper de ancho máximo + padding horizontal responsive. Envuelve el
 * contenido de cada sección de página.
 */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  )
}
