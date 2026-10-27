import type { ReactNode } from 'react'
import { DocsThemeProvider } from '../components/DocsThemeProvider.tsx'
import { SiteConfigProvider } from '../components/SiteConfig.tsx'
import type { SiteConfig } from '../config.ts'
import { docsThemeScript } from '../theme.ts'

/**
 * `app/layout.tsx`: `export default createRootLayout(site)`. The document, the theme glue and the
 * config for the chrome. It renders no chrome itself: each route segment imports only its own UI,
 * so Next.js loads each segment's CSS in the order the segments nest, as a site's would.
 */
export function createRootLayout({ config }: { config: SiteConfig }) {
  const headScript = docsThemeScript(config)
  return function RootLayout({ children }: { children: ReactNode }) {
    return (
      // The head script sets data-theme and data-mode before hydration, so they differ from the
      // server's.
      <html lang="en" data-theme={config.theme.default} data-mode="system" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: headScript }} />
        </head>
        <body>
          <SiteConfigProvider config={config}>
            <DocsThemeProvider>{children}</DocsThemeProvider>
          </SiteConfigProvider>
        </body>
      </html>
    )
  }
}
