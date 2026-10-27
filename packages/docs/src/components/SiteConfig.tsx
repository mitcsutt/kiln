'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SiteConfig } from '../config.ts'

const SiteConfigContext = createContext<SiteConfig | undefined>(undefined)

/**
 * Hands the site's config to the chrome's client components. The root layout renders it with the
 * config from `site.config.ts`, which holds data only, so it crosses to the browser as it is.
 */
export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig
  children: ReactNode
}) {
  return <SiteConfigContext value={config}>{children}</SiteConfigContext>
}

/** The site's config, inside the root layout. */
export function useSiteConfig(): SiteConfig {
  const config = useContext(SiteConfigContext)
  if (!config) throw new Error('kiln-docs: the chrome renders inside the root layout.')
  return config
}
