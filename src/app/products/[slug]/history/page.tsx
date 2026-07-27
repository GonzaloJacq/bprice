import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Container } from "@/components/shared/container"
import { EmptyState } from "@/components/shared/empty-state"
import { Section } from "@/components/shared/section"
import { APP_ROUTES } from "@/shared/constants/routes"

interface HistoryPageProps {
  params: Promise<{ slug: string }>
}

/**
 * El historial de precios requiere una capa de persistencia propia
 * (scraping periódico + base de datos) que todavía no existe — mostramos
 * un estado vacío honesto en vez de inventar una serie de datos.
 */
export default async function HistoryPage({ params }: HistoryPageProps) {
  const { slug } = await params

  return (
    <Section>
      <Container className="flex flex-col gap-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: APP_ROUTES.home },
            { label: "Resultados", href: APP_ROUTES.search },
            { label: "Producto", href: APP_ROUTES.productDetail(slug) },
            { label: "Historial" },
          ]}
        />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Historial de precio</h1>
        </div>

        <EmptyState
          title="Todavía no hay historial disponible"
          description="El historial de precios requiere registrar observaciones a lo largo del tiempo. Por ahora solo mostramos el precio actual en Detalle y Comparación."
        />
      </Container>
    </Section>
  )
}
