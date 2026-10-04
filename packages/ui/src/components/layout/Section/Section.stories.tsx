import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Inline } from '#components/layout/Inline'
import { Container } from '#components/layout/Container'
import { Split } from '#components/layout/Split'
import { Button } from '#components/actions/Button'
import { Body, Figure, Label, Title } from '#components/layout/_story/StoryKit'
import { Section } from './Section'

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
          <Title level={2}>Writing</Title>
          <Body tone="muted">
            Notes on design systems, TypeScript and building small tools for friends.
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
                <Title level={2}>Hawks lead by two</Title>
                <Body tone="muted">
                  Rovers and Riverside both won; Westbank lost on penalties in the cup.
                </Body>
              </Stack>
              <Button variant="outline" tone="neutral">
                See the table
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
              Fieldwork
            </Title>
            <Body size="lg" tone="muted">
              A four-person studio making maps, signs and books for public places.
            </Body>
          </Stack>
        </Container>
      </Section>
      <Section space={{ base: 6, md: 7 }} surface="sunken" divider="both">
        <Container>
          <Split ratio="1/3" gap={{ base: 3, md: 7 }} collapseBelow="sm" align="baseline">
            <Label>Now</Label>
            <Body>Signage for a new library, and a transit map for a coastal city.</Body>
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
                <Body>Drawings revised</Body>
                <Figure>214</Figure>
              </Inline>
              <Inline justify="between" gap={3} wrap={false}>
                <Body>Signs approved</Body>
                <Figure>63</Figure>
              </Inline>
              <Inline justify="between" gap={3} wrap={false}>
                <Body>Site visits</Body>
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
              <Title level={2}>Working on something similar?</Title>
              <Body tone="muted">We reply to most email within a couple of days.</Body>
            </Stack>
            <Button tone="accent">Email the studio</Button>
          </Inline>
        </Container>
      </Section>
    </>
  ),
}
