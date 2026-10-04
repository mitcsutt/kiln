import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Section } from '#components/layout/Section'
import { Body, Cell, Title } from '#components/layout/_story/StoryKit'
import { Container } from './Container'

const meta = {
  title: 'UI/Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: { width: 'content', gutter: true },
  argTypes: { as: { control: false } },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Container {...args}>
      <Cell>width = {args.width}</Cell>
    </Container>
  ),
}

/** Every width, with the fluid gutter outside it. `text` is the prose measure. */
export const Widths: Story = {
  render: () => (
    <Stack gap={3}>
      {(['narrow', 'text', 'content', 'wide', 'full'] as const).map((w) => (
        <Container key={w} width={w}>
          <Cell>{w}</Cell>
        </Container>
      ))}
    </Stack>
  ),
}

/** An article at the prose measure. The gutter sits outside the width, so the measure holds on every screen. */
export const Article: Story = {
  render: () => (
    <Section space={{ base: 7, md: 9 }}>
      <Container width="text">
        <Stack gap={5}>
          <Title level={1} size="xl">
            Building a league table that updates itself
          </Title>
          <Body size="lg">
            Eight clubs, fourteen rounds and a group chat that wanted live results. The first
            version was a spreadsheet; this is the fourth.
          </Body>
          <Body tone="muted">
            Home clubs enter results from the touchline. The server only tells the app something
            changed when a content hash does, so an idle afternoon costs nothing.
          </Body>
        </Stack>
      </Container>
    </Section>
  ),
}
