import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Inline, Spinner, Text } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Feedback/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

/** Every prop as a control. */
export const Playground: Story = {}

/**
 * `label` is announced to screen readers ("Loading departures"). Pass `label={null}` when the
 * surrounding text already says what's loading, so it isn't announced twice. `size="inherit"`
 * matches the surrounding font size. Buttons have their own `loading` state, and for content with
 * a known shape a [Skeleton](/docs/ui/display/skeleton) jumps less.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Inline gap={6}>
        <Spinner size="sm" label="Loading departures" />
        <Spinner label="Loading departures" />
        <Spinner size="lg" label="Loading departures" />
        <Text>
          Checking seats <Spinner size="inherit" label={null} />
        </Text>
        <Button loading>Booking</Button>
      </Inline>
    )
  },
}
