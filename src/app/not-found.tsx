import Link from "next/link"

import { Container } from "@/components/shared/container"
import { EmptyState } from "@/components/shared/empty-state"
import { Section } from "@/components/shared/section"
import { buttonVariants } from "@/components/ui/button"
import { APP_ROUTES } from "@/shared/constants/routes"
import { cn } from "@/shared/lib/utils"

export default function NotFound() {
  return (
    <Section className="py-24">
      <Container>
        <EmptyState
          title="Página no encontrada"
          description="La página que buscás no existe o fue movida."
          action={
            <Link href={APP_ROUTES.home} className={cn(buttonVariants({ variant: "default" }))}>
              Volver al inicio
            </Link>
          }
        />
      </Container>
    </Section>
  )
}
