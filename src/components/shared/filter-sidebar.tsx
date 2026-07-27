import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface FilterStore {
  slug: string
  name: string
}

interface FilterSidebarProps {
  categories?: readonly string[]
  stores?: readonly FilterStore[]
  className?: string
}

const DEFAULT_CATEGORIES = ["Almacén", "Bebidas", "Lácteos", "Limpieza"]

/**
 * Filtros laterales de la página de Resultados. 100% decorativo: no hay
 * `onCheckedChange`/`onValueChange` conectados a ningún estado todavía.
 */
export function FilterSidebar({
  categories = DEFAULT_CATEGORIES,
  stores = [],
  className,
}: FilterSidebarProps) {
  return (
    <div className={className}>
      <h2 className="mb-4 text-sm font-medium">Filtros</h2>
      <Accordion defaultValue={["categoria", "tienda", "precio"]}>
        <AccordionItem value="categoria">
          <AccordionTrigger>Categoría</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <Checkbox id={`category-${category}`} />
                <Label htmlFor={`category-${category}`} className="font-normal">
                  {category}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tienda">
          <AccordionTrigger>Tienda</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            {stores.map((store) => (
              <div key={store.slug} className="flex items-center gap-2">
                <Checkbox id={`store-${store.slug}`} />
                <Label htmlFor={`store-${store.slug}`} className="font-normal">
                  {store.name}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="precio">
          <AccordionTrigger>Precio</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pt-1">
            <Slider defaultValue={[50]} max={300} step={10} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>$300+</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
