import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Container, Heading, Section, Stack, Text } from '@mitcsutt/kiln-ui'
import { Inline } from '#components/layout/Inline'
import { Split } from '#components/layout/Split'
import { Body, Figure, Label, Title } from '#components/layout/_story/StoryKit'

const meta = {
  title: 'UI/Layout/Section',
  component: Section,
  parameters: { layout: 'fullscreen' },
  args: { space: 8, surface: 'sunken', divider: 'both' },
  argTypes: { as: { control: false } },
} satisfies Meta<typeof Section>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Section {...args}>
      <Container>
        <Stack gap={3}>
          <Title level={2}>Changelog</Title>
          <Body tone="muted">
            What shipped this month across the workspace, and what comes next.
          </Body>
        </Stack>
      </Container>
    </Section>
  ),
}

/**
 * Each surface re-points ink for its children: muted text, hairlines and focus rings
 * stay legible on `inverse` and `accent` without any per-child props.
 */
export const Surfaces: Story = {
  render: () => (
    <>
      {(['canvas', 'surface', 'sunken', 'inverse', 'accent'] as const).map((surface, i) => (
        <Section
          key={surface}
          surface={surface}
          space={i % 2 ? 6 : 7}
          divider={surface === 'surface' ? 'both' : undefined}
        >
          <Container>
            <Inline justify="between" gap={4} align="end">
              <Stack gap={1}>
                <Label>{surface}</Label>
                <Title level={2}>Release 2.4 ships Thursday</Title>
                <Body tone="muted">
                  Billing and search are merged; the mobile app slips to next week.
                </Body>
              </Stack>
              <Button variant="outline" tone="neutral">
                See the release
              </Button>
            </Inline>
          </Container>
        </Section>
      ))}
    </>
  ),
}

/**
 * Vary the rhythm: a tall opening, a tighter band, a heavy break. Adjacent sections
 * never share a `space` step.
 */
export const PageRhythm: Story = {
  render: () => (
    <>
      <Section space={{ base: 8, md: 10 }}>
        <Container>
          <Stack gap={5}>
            <Title level={1} size="display">
              Brightline Labs
            </Title>
            <Body size="lg" tone="muted">
              A five-person software company building invoicing tools for small teams.
            </Body>
          </Stack>
        </Container>
      </Section>
      <Section space={{ base: 6, md: 7 }} surface="sunken" divider="both">
        <Container>
          <Split ratio="1/3" gap={{ base: 3, md: 7 }} collapseBelow="sm" align="baseline">
            <Label>Now</Label>
            <Body>Recurring invoices, and a rebuilt client portal.</Body>
          </Split>
        </Container>
      </Section>
      <Section space={{ base: 7, md: 9 }}>
        <Container>
          <Split ratio="5/7" gap={{ base: 4, md: 7 }}>
            <Title level={2} size="xl">
              This month
            </Title>
            <Stack gap={4} dividers>
              <Inline justify="between" gap={3} wrap={false}>
                <Body>Invoices sent</Body>
                <Figure>2,140</Figure>
              </Inline>
              <Inline justify="between" gap={3} wrap={false}>
                <Body>Releases shipped</Body>
                <Figure>6</Figure>
              </Inline>
              <Inline justify="between" gap={3} wrap={false}>
                <Body>Roadmap items done</Body>
                <Figure>4 of 8</Figure>
              </Inline>
            </Stack>
          </Split>
        </Container>
      </Section>
      <Section space={{ base: 7, md: 8 }} surface="inverse">
        <Container>
          <Inline justify="between" gap={5} align="center">
            <Stack gap={2}>
              <Title level={2}>Running a small team?</Title>
              <Body tone="muted">Try it free for 30 days. No card needed.</Body>
            </Stack>
            <Button tone="accent">Start free trial</Button>
          </Inline>
        </Container>
      </Section>
    </>
  ),
}

/**
 * Vary `space` between neighbours. The scale is non-linear for this reason: a page of `space={8}`
 * everywhere has no rhythm at all.
 */
export const Usage: Story = {
  tags: ['docs'],
  parameters: { layout: 'fullscreen' },
  render: function Usage() {
    return (
      <>
        <Section space={7}>
          <Container width="text">
            <Stack gap={3}>
              <Heading level={3} size="2xl">
                Ride the coast for less
              </Heading>
              <Text tone="muted">An annual pass covers every ferry and bus in the bay.</Text>
            </Stack>
          </Container>
        </Section>
        <Section space={6} surface="inverse" divider="top">
          <Container width="text">
            <Stack gap={4} align="start">
              <Text>Commuting every day? The pass pays for itself in five weeks.</Text>
              <Button>Buy an annual pass</Button>
            </Stack>
          </Container>
        </Section>
      </>
    )
  },
}

/**
 * `surface="cat-1"` to `"cat-8"` paints a band in a categorical colour, one person's or team's
 * colour, matching their `Tag`. Ink and lines flip to stay legible on it.
 */
export const CategoricalBand: Story = {
  name: 'Categorical band',
  tags: ['docs'],
  parameters: { layout: 'fullscreen' },
  render: function CategoricalBand() {
    return (
      <Section surface="cat-2" space={6}>
        <Container>
          <Stack gap={2}>
            <Heading level={2}>Ada's crew</Heading>
            <Text tone="muted">Three boats, eleven crossings this week.</Text>
          </Stack>
        </Container>
      </Section>
    )
  },
}
