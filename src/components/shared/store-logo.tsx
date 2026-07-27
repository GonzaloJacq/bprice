import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface StoreLogoProps {
  name: string
  size?: "default" | "sm" | "lg"
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/**
 * Logo de tienda. Hoy solo muestra iniciales (`logoUrl` es siempre null en
 * los datos mock/reales todavía) — cuando exista una imagen real, alcanza
 * con pasarle un `src` a un `AvatarImage` acá adentro.
 */
export function StoreLogo({ name, size = "default", className }: StoreLogoProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
