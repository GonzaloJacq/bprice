import { Search } from "lucide-react"
import type { ComponentProps } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/shared/lib/utils"

type SearchInputProps = Omit<ComponentProps<"input">, "type">

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input type="search" className={cn("pl-8", className)} {...props} />
    </div>
  )
}
