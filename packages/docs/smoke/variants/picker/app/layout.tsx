// kiln-docs route v1 82beb1c57693: written by @mitcsutt/kiln-docs, which updates it while it's unedited.
import '@mitcsutt/kiln-ui/styles.css'
// Each theme the picker offers but Paper, which is in kiln-ui's styles.css.
import '@mitcsutt/kiln-ui/themes/flightdeck.css'
import '@mitcsutt/kiln-ui/themes/riso.css'
import '@mitcsutt/kiln-docs/styles.css'
import { createRootLayout } from '@mitcsutt/kiln-docs/layout'
import { site } from '@/lib/site'

export const metadata = site.metadata

export default createRootLayout(site)
