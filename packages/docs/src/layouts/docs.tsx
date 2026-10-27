import type * as PageTree from 'fumadocs-core/page-tree'
import type { ReactNode } from 'react'
import { DocsShell } from '../components/shell/DocsShell.tsx'

/** `app/docs/layout.tsx`: `export default createDocsLayout(site)`. The chrome, with the sidebar. */
export function createDocsLayout({ source }: { source: { getPageTree: () => PageTree.Root } }) {
  return function DocsLayout({ children }: { children: ReactNode }) {
    return <DocsShell tree={source.getPageTree()}>{children}</DocsShell>
  }
}
