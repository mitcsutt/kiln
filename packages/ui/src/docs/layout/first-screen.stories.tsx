import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Container, Heading, Inline, Section, Stack, Text } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Layout/First screen',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Screens are built from layout primitives and typed props, never utility classes or inline
 * styles: `gap={5}` is a step on the theme's space scale, `width="text"` is a reading measure,
 * `tone="critical"` is an intent.
 *
 * If a screen needs CSS beyond a layout wrapper or two, Kiln is probably missing a prop or a
 * component. Read [Layout](/docs/ui/layout/stack) for the primitives that replace most custom CSS.
 */
export const Usage: Story = {
  name: 'Compose a screen',
  tags: ['docs'],
  render: function Usage() {
    return (
      <Section space={7}>
        <Container width="text">
          <Stack gap={5}>
            <Heading level={1} size="display-sm">
              Maps for people in a hurry
            </Heading>
            <Text size="lg" tone="muted">
              Every ferry, tram and night bus in the bay, on one timetable that fits in a pocket.
            </Text>
            <Inline gap={3}>
              <Button>Download the timetable</Button>
              <Button variant="outline" tone="neutral">
                See the route map
              </Button>
            </Inline>
          </Stack>
        </Container>
      </Section>
    )
  },
}
