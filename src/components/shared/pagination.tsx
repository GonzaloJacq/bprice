"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Wrapper de paginación construido sobre Button — shadcn/ui no distribuye
 * un componente Pagination propio en este registro.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: PaginationProps) {
  const canGoPrevious = page > 1
  const canGoNext = page < pageCount

  return (
    <nav
      aria-label="Paginación"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <Button
        variant="outline"
        size="icon"
        disabled={!canGoPrevious}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft />
      </Button>
      <span className="text-muted-foreground text-sm">
        Página {page} de {pageCount}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={!canGoNext}
        onClick={() => onPageChange(page + 1)}
        aria-label="Página siguiente"
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}
