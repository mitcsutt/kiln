'use client'

import {
  Amount,
  Badge,
  Button,
  Code,
  Container,
  Delta,
  Grid,
  Heading,
  Inline,
  List,
  Section,
  Split,
  Stack,
  Text,
  THEME_META,
  THEMES,
  ThemeScope,
  type BuiltInThemeName,
} from '@mitcsutt/kiln-ui'
import NextLink from 'next/link'
import styles from './Home.module.css'

const PACKAGES = [
  {
    name: '@mitcsutt/kiln-ui',
    href: '/docs/ui',
    summary: 'Components on Radix primitives, styled by tokens. One theme is one CSS file.',
  },
  {
    name: '@mitcsutt/kiln-forms',
    href: '/docs/forms',
    summary: 'Typed forms on TanStack Form, written as components or described as JSON.',
  },
  {
    name: '@mitcsutt/kiln-eslint-config',
    href: '/docs/tooling/eslint-config',
    summary: 'A type-aware flat config with no warning tier.',
  },
  {
    name: '@mitcsutt/kiln-prettier-config',
    href: '/docs/tooling/prettier-config',
    summary: 'Single quotes, no semicolons, a 100-column line.',
  },
  {
    name: '@mitcsutt/kiln-tsconfig',
    href: '/docs/tooling/tsconfig',
    summary: 'Strict presets for libraries, apps and Node tooling.',
  },
] as const

/** The same few components in one theme: the specimen sheet on the home page. */
function Specimen({ theme }: { theme: BuiltInThemeName }) {
  return (
    <ThemeScope theme={theme} className={styles.specimen}>
      <Stack gap={5}>
        <Stack gap={2}>
          <Heading level={3} size="xl">
            {THEME_META[theme].label}
          </Heading>
          <Text size="sm" tone="muted">
            {THEME_META[theme].description}
          </Text>
        </Stack>
        <Inline gap={3} align="end">
          <Amount value={4812.5} currency="GBP" size="2xl" />
          <Delta direction="up" tone="positive">
            12%
          </Delta>
        </Inline>
        <Inline gap={2}>
          <Button size="sm">Send invoice</Button>
          <Button size="sm" variant="outline" tone="neutral">
            Export CSV
          </Button>
          <Badge tone="positive">Live</Badge>
        </Inline>
      </Stack>
    </ThemeScope>
  )
}

export function Home() {
  return (
    <>
      <Section space={9}>
        <Container width="wide">
          <Split ratio="7/5" gap={8} align="end">
            <Stack gap={5}>
              <Heading level={1} size="display-lg">
                Kiln
              </Heading>
              <Text size="xl" measure="text">
                One React component library with many personalities. The same{' '}
                <Code>{'<Button>'}</Code> is a graphite key in Paper and a screen-printed sticker in
                Fiesta: a theme decides everything you see, and a theme is one CSS file.
              </Text>
              <Inline gap={3}>
                <Button asChild>
                  <NextLink href="/docs/ui">Read the UI docs</NextLink>
                </Button>
                <Button asChild variant="outline" tone="neutral">
                  <NextLink href="/docs/forms">Build a form</NextLink>
                </Button>
              </Inline>
            </Stack>
            <Text size="sm" tone="muted">
              Switch the theme in the header and every page of these docs, chrome included, renders
              in it. The four below stay put, so you can compare them.
            </Text>
          </Split>
        </Container>
      </Section>
      <Section space={8} divider="top" surface="sunken">
        <Container width="wide">
          <Grid minItemWidth="sm" gap={5}>
            {THEMES.map((theme) => (
              <Specimen key={theme} theme={theme} />
            ))}
          </Grid>
        </Container>
      </Section>
      <Section space={9}>
        <Container width="wide">
          <Split ratio="5/7" gap={8}>
            <Stack gap={3}>
              <Heading level={2} size="2xl">
                Five packages
              </Heading>
              <Text tone="muted">
                Published under <Code>@mitcsutt</Code>, each versioned on its own. None is on npm
                yet.
              </Text>
            </Stack>
            <List divided>
              {PACKAGES.map((pkg) => (
                <List.Item key={pkg.name}>
                  <Stack gap={1}>
                    <NextLink href={pkg.href} className={styles.packageLink}>
                      <Code>{pkg.name}</Code>
                    </NextLink>
                    <Text size="sm" tone="muted">
                      {pkg.summary}
                    </Text>
                  </Stack>
                </List.Item>
              ))}
            </List>
          </Split>
        </Container>
      </Section>
    </>
  )
}
