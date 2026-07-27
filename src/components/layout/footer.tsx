import Link from "next/link"

import { Container } from "@/components/shared/container"
import { Separator } from "@/components/ui/separator"
import { APP_CONFIG } from "@/shared/constants/config"
import { APP_ROUTES } from "@/shared/constants/routes"
import { SUPPORTED_STORES } from "@/shared/constants/stores"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="grid gap-8 py-12 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">{APP_CONFIG.siteName}</span>
          <p className="text-sm text-muted-foreground">{APP_CONFIG.siteDescription}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Navegación</span>
          <Link href={APP_ROUTES.home} className="text-muted-foreground hover:text-foreground">
            Inicio
          </Link>
          <Link href={APP_ROUTES.search} className="text-muted-foreground hover:text-foreground">
            Resultados
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Tiendas</span>
          {SUPPORTED_STORES.map((store) => (
            <span key={store.slug} className="text-muted-foreground">
              {store.name}
            </span>
          ))}
        </div>
      </Container>

      <Separator />

      <Container className="flex h-16 items-center justify-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {APP_CONFIG.siteName}
      </Container>
    </footer>
  )
}
