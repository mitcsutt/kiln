'use client'

import { Button, Container, EmptyState, Section } from '@mitcsutt/kiln-ui'
import NextLink from 'next/link'

export function NotFound() {
  return (
    <Section space={10}>
      <Container width="text">
        <EmptyState
          titleAs="h1"
          title="No page here"
          description="It may have moved when the docs were reorganised. Search from the header, or start from the UI docs."
          action={
            <Button asChild>
              <NextLink href="/docs/ui">Open the UI docs</NextLink>
            </Button>
          }
          framed
        />
      </Container>
    </Section>
  )
}
