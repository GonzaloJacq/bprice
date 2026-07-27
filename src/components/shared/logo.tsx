import Link from "next/link"

import { APP_CONFIG } from "@/shared/constants/config"
import { APP_ROUTES } from "@/shared/constants/routes"
import { cn } from "@/shared/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href={APP_ROUTES.home}
      className={cn("text-lg font-semibold tracking-tight", className)}
    >
      {APP_CONFIG.siteName}
    </Link>
  )
}
