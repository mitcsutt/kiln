import type { Metadata } from 'next'
import { Container, Section } from '@mitcsutt/kiln-ui'
import { DemoFrame } from '@/components/demo/DemoFrame'
import { DocsShell } from '@/components/shell/DocsShell'

export const metadata: Metadata = {
  title: 'Demo app',
  description: 'Slipcast, a pottery co-op app built with every Kiln component, in all four themes.',
}

export default function DemoPage() {
  return (
    <DocsShell>
      <Section space={6}>
        <Container width="full">
          <DemoFrame />
        </Container>
      </Section>
    </DocsShell>
  )
}
