/**
 * Utilidades puras de formateo. Sin dependencias externas ni estado:
 * dado el mismo input, siempre devuelven el mismo output.
 */

export function formatCurrency(
  amount: number,
  currency = "UYU",
  locale = "es-UY"
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount
  )
}

export function formatDate(isoDate: string, locale = "es-UY"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(isoDate)
  )
}
