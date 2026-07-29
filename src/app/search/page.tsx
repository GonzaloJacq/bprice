import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { SearchResults } from "@/features/search/components/search-results"
import { APP_ROUTES } from "@/shared/constants/routes"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

/**
 * Resultados reales: busca en paralelo en todos los STORE_PROVIDERS (hoy
 * solo Thot Computación responde con datos). `q` puede no traer resultados
 * de ninguna tienda — es un resultado válido, no un error.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q ?? ""

  return (
    <Section>
      <Container className="flex flex-col gap-6">
        <Breadcrumb
          items={[{ label: "Inicio", href: APP_ROUTES.home }, { label: "Resultados" }]}
        />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {query ? `Resultados para "${query}"` : "Buscá un producto"}
          </h1>
        </div>

        <SearchResults query={query} />
      </Container>
    </Section>
  )
}
