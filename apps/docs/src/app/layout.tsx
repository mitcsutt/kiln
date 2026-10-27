import '@mitcsutt/kiln-ui/styles.css'
// Every page is a preview of every theme, so the root layout imports each theme the picker offers.
import '@mitcsutt/kiln-ui/themes/monograph.css'
import '@mitcsutt/kiln-ui/themes/ledger.css'
import '@mitcsutt/kiln-ui/themes/fiesta.css'
import '@mitcsutt/kiln-ui/themes/flightdeck.css'
import '@mitcsutt/kiln-ui/themes/riso.css'
import '@mitcsutt/kiln-docs/styles.css'
// The Theming guide's custom theme: an ordinary consumer stylesheet.
import '@/styles/harbour.css'
import { createRootLayout } from '@mitcsutt/kiln-docs/layout'
import { site } from '@/lib/site'

export const metadata = site.metadata

export default createRootLayout(site)
