import type { ReactNode } from 'react'
import { DocsShell } from '@/components/shell/DocsShell'
import { source } from '@/lib/source'

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell tree={source.getPageTree()}>{children}</DocsShell>
}
