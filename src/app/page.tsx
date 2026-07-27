import { AdBanner } from "@/components/shared/ad-banner"
import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { SearchBar } from "@/components/shared/search-bar"
import { StoreBadge } from "@/components/shared/store-badge"
import { APP_CONFIG } from "@/shared/constants/config"
import { SUPPORTED_STORES } from "@/shared/constants/stores"

/**
 * Home. Sin secciones de catálogo fijo: sin una fuente de datos propia no
 * hay base real para "productos populares" o "últimas bajadas". Los
 * resultados reales viven en /search.
 */
export default function Home() {
  return (
    <>
      <Section className="py-16 sm:py-24">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Compará precios en tiendas de Uruguay
          </h1>
          <p className="max-w-lg text-muted-foreground">
            {APP_CONFIG.siteDescription} en {SUPPORTED_STORES.length} tiendas.
          </p>
          <SearchBar size="lg" className="max-w-xl" />
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold tracking-tight">Tiendas disponibles</h2>
          <div className="flex flex-wrap gap-3">
            {SUPPORTED_STORES.map((store) => (
              <StoreBadge key={store.slug} name={store.name} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <AdBanner />
        </Container>
      </Section>
    </>
  )
}
