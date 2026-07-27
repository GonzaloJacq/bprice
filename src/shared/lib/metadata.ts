import type { Metadata } from "next"

import { APP_CONFIG } from "@/shared/constants/config"

interface BuildMetadataParams {
  title?: string
  description?: string
}

/**
 * Helper central para construir Metadata consistente en toda la app.
 * Cada página/feature lo llama con sus valores propios en vez de
 * duplicar title/description a mano.
 */
export function buildMetadata({
  title,
  description,
}: BuildMetadataParams = {}): Metadata {
  const resolvedTitle = title
    ? `${title} | ${APP_CONFIG.siteName}`
    : APP_CONFIG.siteName

  return {
    title: resolvedTitle,
    description: description ?? APP_CONFIG.siteDescription,
  }
}
