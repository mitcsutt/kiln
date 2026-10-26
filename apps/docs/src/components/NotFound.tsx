'use client'

import { Button, Container, EmptyState, Section } from '@mitcsutt/kiln-ui'
import NextLink from 'next/link'
import { site } from '@/lib/site'

export function NotFound() {
  return (
    <Section space={10}>
      <Container width="text">
        <EmptyState
          titleAs="h1"
          title="No page here"
          description={site.notFound.description}
          action={
            <Button asChild>
              <NextLink href={site.notFound.action.href}>{site.notFound.action.label}</NextLink>
            </Button>
          }
          framed
        />
      </Container>
    </Section>
  )
}
