import { SlidersHorizontal } from "lucide-react"

import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Container } from "@/components/shared/container"
import { FilterSidebar } from "@/components/shared/filter-sidebar"
import { Section } from "@/components/shared/section"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SearchResults } from "@/features/search/components/search-results"
import { APP_ROUTES } from "@/shared/constants/routes"
import { SUPPORTED_STORES } from "@/shared/constants/stores"

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

        <div className="flex items-center justify-between gap-4">
          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" size="sm" className="gap-2 lg:hidden" />}
            >
              <SlidersHorizontal className="size-4" />
              Filtros
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <FilterSidebar stores={SUPPORTED_STORES} />
              </div>
            </SheetContent>
          </Sheet>

          <Select defaultValue="relevancia">
            <SelectTrigger className="ml-auto w-[200px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevancia">Relevancia</SelectItem>
              <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <FilterSidebar stores={SUPPORTED_STORES} className="hidden lg:block" />

          <SearchResults query={query} />
        </div>
      </Container>
    </Section>
  )
}
