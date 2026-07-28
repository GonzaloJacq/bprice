import type { MatchedProduct, StoreSearchHit } from "@/shared/types"

/**
 * Agrupa resultados de búsqueda de distintas tiendas en productos "matcheados"
 * por heurística de nombre — estas tiendas uruguayas no exponen GTIN/SKU
 * compartido, así que no hay identificador exacto para comparar.
 *
 * Limitaciones conocidas y aceptadas:
 * - Falsos positivos: nombres muy genéricos y similares de productos
 *   distintos pueden sobre-agruparse si `brand` no está disponible (hoy
 *   ningún provider lo completa, así que el gate por marca está inactivo en
 *   la práctica). El caso más común detectado en la práctica — un accesorio
 *   nombrando a su producto "padre" (ej. "Reposamuñeca para Teclado G512" vs
 *   "Teclado G512") — tiene su propio gate (`accessoryConflict`), pero no
 *   cubre variantes/ediciones distintas de un mismo producto base si no usan
 *   ninguna palabra de `ACCESSORY_WORDS`.
 * - Falsos negativos: mismo producto con fraseo muy distinto entre tiendas
 *   (orden de palabras, abreviaturas, traducciones) puede no superar el
 *   umbral y quedar como grupos separados.
 * - Degradación aceptada: un hit que no matchea con nadie queda como su
 *   propio `MatchedProduct` de 1 sola oferta — nunca se descarta un hit.
 *
 * `SIMILARITY_THRESHOLD` es un punto de partida sin calibrar contra datos
 * reales de más de una tienda; se debe revisar en cuanto haya providers
 * reales además de Thot.
 */
export const SIMILARITY_THRESHOLD = 0.5

const NOISE_WORDS = new Set([
  "de",
  "con",
  "para",
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "oferta",
  "ofertas",
  "envio",
  "gratis",
  "nuevo",
  "nueva",
  "promo",
  "promocion",
  "outlet",
  "liquidacion",
  "cuotas",
  "sin",
  "interes",
  "hot",
  "sale",
  "original",
  "originales",
])

/**
 * Palabras que señalan que un nombre es un ACCESORIO de otro producto, no el
 * producto en sí (ej. "Reposamuñeca para Teclado G512" vs "Teclado G512"
 * comparten casi todos los tokens del nombre — sin este gate matchean con
 * similitud alta siendo productos completamente distintos, con precios no
 * comparables). Lista acotada a casos inequívocos para no descartar
 * productos legítimos cuyo nombre use alguna de estas palabras.
 */
const ACCESSORY_WORDS = new Set([
  "reposamuneca",
  "funda",
  "estuche",
  "case",
  "cargador",
  "cable",
  "adaptador",
  "soporte",
  "repuesto",
  "accesorio",
  "protector",
  "correa",
])

/** Minúsculas, sin acentos, sin puntuación, espacios colapsados. */
export function normalizeProductName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Tokeniza y filtra ruido. Los tokens numéricos (128gb, 55, 4070) NO se
 * descartan — suelen ser el dato más discriminante (capacidad, tamaño, modelo).
 */
export function tokenizeProductName(name: string): Set<string> {
  const tokens = normalizeProductName(name)
    .split(" ")
    .filter((token) => token.length > 1 && !NOISE_WORDS.has(token))
  return new Set(tokens)
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersectionSize = 0
  for (const token of a) {
    if (b.has(token)) intersectionSize++
  }
  const unionSize = a.size + b.size - intersectionSize
  return unionSize === 0 ? 0 : intersectionSize / unionSize
}

interface HitGroup {
  hits: StoreSearchHit[]
  tokens: Set<string>
  currency: string
}

function brandsConflict(a: StoreSearchHit, b: StoreSearchHit): boolean {
  const brandA = a.product.brand
  const brandB = b.product.brand
  if (!brandA || !brandB) return false
  return normalizeProductName(brandA) !== normalizeProductName(brandB)
}

function hasAccessoryWord(name: string): boolean {
  const tokens = tokenizeProductName(name)
  for (const word of ACCESSORY_WORDS) {
    if (tokens.has(word)) return true
  }
  return false
}

/**
 * Un accesorio y su producto "padre" comparten casi todos los tokens del
 * nombre (el accesorio lo nombra) pero son productos distintos con precios
 * no comparables — nunca deben matchear entre sí.
 */
function accessoryConflict(a: StoreSearchHit, b: StoreSearchHit): boolean {
  return hasAccessoryWord(a.product.name) !== hasAccessoryWord(b.product.name)
}

/**
 * Agrupa hits de búsqueda en productos matcheados vía clustering greedy: cada
 * hit se une al grupo existente de mayor similitud si supera el umbral (y
 * está en la misma moneda, ninguna otra oferta del grupo es de la misma
 * tienda, sus marcas no entran en conflicto, y no es un accesorio de/para el
 * otro); si ninguno califica, crea un grupo nuevo. No se comparan monedas
 * distintas entre sí: mezclar USD y UYU en un mismo grupo invalidaría
 * cualquier ranking de "mejor precio" sin una tasa de cambio (decisión de
 * producto: no inventarla). Tampoco se agrupan dos hits de la misma tienda
 * entre sí — una tienda vende cada producto una sola vez, así que dos
 * listados propios "similares" son productos distintos (o variantes), nunca
 * dos ofertas del mismo producto.
 */
export function matchProducts(hits: StoreSearchHit[]): MatchedProduct[] {
  const groups: HitGroup[] = []

  for (const hit of hits) {
    const tokens = tokenizeProductName(hit.product.name)
    const currency = hit.price.currency

    let bestGroup: HitGroup | null = null
    let bestSimilarity = SIMILARITY_THRESHOLD

    for (const group of groups) {
      if (group.currency !== currency) continue
      if (group.hits.some((existingHit) => existingHit.price.storeId === hit.price.storeId)) continue
      if (group.hits.some((existingHit) => brandsConflict(existingHit, hit))) continue
      if (group.hits.some((existingHit) => accessoryConflict(existingHit, hit))) continue

      const similarity = jaccardSimilarity(group.tokens, tokens)
      if (similarity >= bestSimilarity) {
        bestGroup = group
        bestSimilarity = similarity
      }
    }

    if (bestGroup) {
      bestGroup.hits.push(hit)
      bestGroup.tokens = new Set([...bestGroup.tokens, ...tokens])
    } else {
      groups.push({ hits: [hit], tokens, currency })
    }
  }

  return groups.map(buildMatchedProduct)
}

function buildMatchedProduct(group: HitGroup): MatchedProduct {
  const offers = [...group.hits].sort((a, b) => a.price.amount - b.price.amount)
  const cheapest = offers[0]

  return {
    id: cheapest.product.slug,
    name: cheapest.product.name,
    brand: cheapest.product.brand,
    imageUrl: cheapest.product.imageUrl,
    category: cheapest.product.category,
    offers,
  }
}
