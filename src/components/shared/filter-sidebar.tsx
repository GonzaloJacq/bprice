import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface FilterStoreOption {
  slug: string
  name: string
}

interface FilterSidebarProps {
  stores: readonly FilterStoreOption[]
  selectedStoreSlugs: ReadonlySet<string>
  onToggleStore: (slug: string) => void
  priceMax: number
  priceLimit: number
  priceLimitLabel: string
  onPriceLimitChange: (value: number) => void
  className?: string
}

/**
 * Filtros laterales de la página de Resultados. Solo tienda y precio: no hay
 * catálogo propio por categoría, así que los únicos filtros con sentido son
 * los que aplican sobre lo que la búsqueda ya trajo (qué tiendas lo venden,
 * a qué precio). Controlado por el padre (`SearchResults`), que es quien
 * tiene los resultados reales para calcular las tiendas y el rango de precio
 * disponibles — este componente es puramente de presentación.
 */
export function FilterSidebar({
  stores,
  selectedStoreSlugs,
  onToggleStore,
  priceMax,
  priceLimit,
  priceLimitLabel,
  onPriceLimitChange,
  className,
}: FilterSidebarProps) {
  return (
    <div className={className}>
      <h2 className="mb-4 text-sm font-medium">Filtros</h2>
      <Accordion defaultValue={["tienda", "precio"]} multiple>
        <AccordionItem value="tienda">
          <AccordionTrigger>Tienda</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            {stores.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Sin tiendas para estos resultados.
              </p>
            ) : (
              stores.map((store) => (
                <div key={store.slug} className="flex items-center gap-2">
                  <Checkbox
                    id={`store-${store.slug}`}
                    checked={selectedStoreSlugs.has(store.slug)}
                    onCheckedChange={() => onToggleStore(store.slug)}
                  />
                  <Label htmlFor={`store-${store.slug}`} className="font-normal">
                    {store.name}
                  </Label>
                </div>
              ))
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="precio">
          <AccordionTrigger>Precio</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pt-1">
            <Slider
              value={[priceLimit]}
              onValueChange={(value) =>
                onPriceLimitChange(Array.isArray(value) ? value[0] : value)
              }
              min={0}
              max={priceMax}
              disabled={priceMax <= 0}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{priceLimitLabel}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
