import type { Metadata } from 'next'
import { Container, Section } from '@mitcsutt/kiln-ui'
import { Shell } from '@mitcsutt/kiln-docs/shell'
import { DemoFrame } from '@/components/demo/DemoFrame'

export const metadata: Metadata = {
  title: 'Demo app',
  description: 'Slipcast, a pottery co-op app built with every Kiln component, in all four themes.',
}

export default function DemoPage() {
  return (
    <Shell>
      <Section space={6}>
        <Container width="full">
          <DemoFrame />
        </Container>
      </Section>
    </Shell>
  )
}
