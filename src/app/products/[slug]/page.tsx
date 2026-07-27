import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { ProductDetail } from "@/features/products/components/product-detail"
import { APP_ROUTES } from "@/shared/constants/routes"

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params

  return (
    <Section>
      <Container className="flex flex-col gap-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: APP_ROUTES.home },
            { label: "Resultados", href: APP_ROUTES.search },
            { label: "Producto" },
          ]}
        />

        <ProductDetail slug={slug} />
      </Container>
    </Section>
  )
}
