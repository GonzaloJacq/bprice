import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { ProductCompare } from "@/features/products/components/product-compare"
import { APP_ROUTES } from "@/shared/constants/routes"

interface ComparePageProps {
  params: Promise<{ slug: string }>
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params

  return (
    <Section>
      <Container className="flex flex-col gap-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: APP_ROUTES.home },
            { label: "Resultados", href: APP_ROUTES.search },
            { label: "Producto", href: APP_ROUTES.productDetail(slug) },
            { label: "Comparación" },
          ]}
        />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Comparación de precios</h1>
          <p className="text-sm text-muted-foreground">
            Hoy solo comparamos entre las tiendas con integración real activa.
          </p>
        </div>

        <ProductCompare slug={slug} />
      </Container>
    </Section>
  )
}
