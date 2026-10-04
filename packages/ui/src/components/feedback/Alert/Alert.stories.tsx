import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { Alert } from './Alert'

const meta = {
  title: 'UI/Feedback/Alert',
  component: Alert,
  args: {
    tone: 'info',
    variant: 'outline',
    title: 'Scores refresh every 30 seconds',
    children: 'Live matches update on their own. Pull down to check now.',
  },
  argTypes: { icon: { control: false }, action: { control: false } },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: (args) => (
    <Stack gap={4}>
      <Alert {...args} tone="info" title="Scores refresh every 30 seconds">
        Live matches update on their own.
      </Alert>
      <Alert {...args} tone="positive" title="September budget saved">
        $4,820.00 allocated across 14 categories.
      </Alert>
      <Alert {...args} tone="caution" title="Groceries is at 85% of its limit">
        $578.40 of $680.00 spent with 9 days left in the month.
      </Alert>
      <Alert
        {...args}
        tone="critical"
        title="Couldn't load fixtures"
        action={
          <Button size="sm" variant="outline" tone="neutral">
            Try again
          </Button>
        }
      >
        The results service didn't answer. The table may be out of date.
      </Alert>
      <Alert {...args} tone="neutral" title={undefined}>
        Scorer data for round 14 is still arriving.
      </Alert>
    </Stack>
  ),
}

/**
 * `soft` is the louder form — a tinted fill and a tone keyline — for the one notice on a
 * screen that must not be missed. Use the default for everything else.
 */
export const Soft: Story = {
  render: (args) => (
    <Stack gap={4}>
      <Alert {...args} variant="soft" tone="info" />
      <Alert {...args} variant="soft" tone="caution" title="Two bills due this week">
        Electricity ($212.35) on Tuesday, water ($96.10) on Friday.
      </Alert>
      <Alert {...args} variant="soft" tone="critical" title="Rent payment failed">
        The bank declined the transfer. Check the account has $2,340.00 available.
      </Alert>
    </Stack>
  ),
}

export const Dismissible: Story = {
  args: {
    tone: 'positive',
    title: 'Fixtures published',
    children: 'Eight clubs, 14 rounds. Every club has seven home games.',
    onDismiss: () => undefined,
  },
}

/** Body only — for one-line notices under a table. */
export const WithoutTitle: Story = {
  args: { title: undefined, tone: 'neutral', children: 'Prices include GST.' },
}
