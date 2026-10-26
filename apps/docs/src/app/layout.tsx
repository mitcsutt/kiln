import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-ui/themes/monograph.css'
import '@mitcsutt/kiln-ui/themes/ledger.css'
import '@mitcsutt/kiln-ui/themes/fiesta.css'
import '@mitcsutt/kiln-ui/themes/flightdeck.css'
import '@mitcsutt/kiln-ui/themes/riso.css'
// The Theming guide's custom theme: an ordinary consumer stylesheet.
import '@/styles/harbour.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DocsThemeProvider } from '@/components/DocsThemeProvider'
import { site } from '@/lib/site'
import { docsThemeScript } from '@/lib/theme'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The head script sets data-theme and data-mode before hydration, so they differ from the server's.
    <html lang="en" data-theme={site.theme.default} data-mode="system" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: docsThemeScript }} />
      </head>
      <body>
        <DocsThemeProvider>{children}</DocsThemeProvider>
      </body>
    </html>
  )
}
