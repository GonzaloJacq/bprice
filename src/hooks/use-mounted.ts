"use client"

import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

/**
 * Devuelve true recién después del primer render en el cliente. Evita
 * mismatches de hidratación en componentes que dependen de estado sólo
 * disponible en el browser (ej. el tema actual con next-themes).
 *
 * Se implementa con useSyncExternalStore (snapshot de servidor = false,
 * snapshot de cliente = true) en vez de useEffect+useState para no disparar
 * un render en cascada.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
