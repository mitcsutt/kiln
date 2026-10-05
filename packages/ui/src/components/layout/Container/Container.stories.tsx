import type { Meta, StoryObj } from '@storybook/react-vite'
import { Container, Stack, Text } from '@mitcsutt/kiln-ui'
import { Section } from '#components/layout/Section'
import { Body, Cell, Title } from '#components/layout/_story/StoryKit'

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
            Building a status page that updates itself
          </Title>
          <Body size="lg">
            Eight services, three regions and a support team that wanted live status. The first
            version was a spreadsheet; this is the fourth.
          </Body>
          <Body tone="muted">
            Each service reports its own health checks. The server only tells the app something
            changed when a content hash does, so a quiet afternoon costs nothing.
          </Body>
        </Stack>
      </Container>
    </Section>
  ),
}

/**
 * The `narrow`, `text` and `content` widths, one above the other.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4}>
        {(['narrow', 'text', 'content'] as const).map((width) => (
          <Container key={width} width={width}>
            <Text size="sm" tone="muted">
              width=&quot;{width}&quot;: the timetable for the coastal line, laid out to this width.
            </Text>
          </Container>
        ))}
      </Stack>
    )
  },
}
