import { Badge } from "@/components/ui/badge"
import { StoreLogo } from "@/components/shared/store-logo"
import { cn } from "@/shared/lib/utils"

interface StoreBadgeProps {
  name: string
  className?: string
}

export function StoreBadge({ name, className }: StoreBadgeProps) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 py-1 pr-2.5 pl-1", className)}>
      <StoreLogo name={name} size="sm" />
      {name}
    </Badge>
  )
}
