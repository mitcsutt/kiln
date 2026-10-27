import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-ui/themes/ledger.css'
import '@mitcsutt/kiln-ui/themes/flightdeck.css'
import '@mitcsutt/kiln-ui/themes/riso.css'
import '@mitcsutt/kiln-dnd/styles.css'
import '@mitcsutt/kiln-charts/styles.css'

import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createAppRouter } from '#app/utils/createAppRouter'
import { ThemePreferenceProvider } from '#stores/themePreference'

const router = createAppRouter()
const root = document.getElementById('root')
if (!root) throw new Error('index.html has no #root element')

createRoot(root).render(
  <StrictMode>
    <ThemePreferenceProvider>
      <RouterProvider router={router} />
    </ThemePreferenceProvider>
  </StrictMode>,
)
