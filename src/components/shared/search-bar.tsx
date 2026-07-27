import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_ROUTES } from "@/shared/constants/routes"
import { cn } from "@/shared/lib/utils"

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
  size?: "default" | "lg"
  className?: string
}

/**
 * Formulario GET nativo hacia /search — navega sin JavaScript ni estado de
 * cliente, por eso puede quedar como Server Component.
 */
export function SearchBar({
  defaultValue,
  placeholder = "Buscar un producto...",
  size = "default",
  className,
}: SearchBarProps) {
  const isLarge = size === "lg"

  return (
    <form
      action={APP_ROUTES.search}
      method="GET"
      className={cn("flex w-full items-center gap-2", className)}
    >
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(isLarge && "h-14 rounded-full px-6 text-base")}
      />
      <Button type="submit" size={isLarge ? "lg" : "default"} className={cn(isLarge && "h-14 rounded-full px-6")}>
        <Search className="size-4" />
        <span className={cn(!isLarge && "sr-only")}>Buscar</span>
      </Button>
    </form>
  )
}
