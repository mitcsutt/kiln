import { Button, Container, Heading, Stack, Text } from '@mitcsutt/kiln-ui'
import { Shell } from '@mitcsutt/kiln-docs/shell'
import Link from 'next/link'

/** The landing page at `/`, the site's own, in the chrome's shell. */
export default function HomePage() {
  return (
    <Shell>
      <Container>
        <Stack gap={4}>
          <Heading level={1}>Smoke Toolbelt</Heading>
          <Text>A docs site built from the packed kiln-docs tarball, outside the workspace.</Text>
          <Button asChild>
            <Link href="/docs">Read the docs</Link>
          </Button>
        </Stack>
      </Container>
    </Shell>
  )
}
