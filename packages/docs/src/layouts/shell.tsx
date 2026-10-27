import type { ReactNode } from 'react'
import { DocsShell } from '../components/shell/DocsShell.tsx'

/** The chrome with no sidebar, for a page of the site's own, such as its landing page. */
export function Shell({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>
}
