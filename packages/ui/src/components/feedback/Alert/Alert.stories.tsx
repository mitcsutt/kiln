import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert, Button, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const meta = {
  title: 'UI/Feedback/Alert',
  component: Alert,
  args: {
    tone: 'info',
    variant: 'outline',
    title: 'Deploys refresh every 30 seconds',
    children: 'Running deploys update on their own. Pull down to check now.',
  },
  argTypes: { icon: { control: false }, action: { control: false } },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: (args) => (
    <Stack gap={4}>
      <Alert {...args} tone="info" title="Deploys refresh every 30 seconds">
        Running deploys update on their own.
      </Alert>
      <Alert {...args} tone="positive" title="September invoices sent">
        $4,820.00 billed across 14 clients.
      </Alert>
      <Alert {...args} tone="caution" title="Storage is at 85% of your plan">
        85 GB of 100 GB used with 9 days left in the billing period.
      </Alert>
      <Alert
        {...args}
        tone="critical"
        title="Couldn't load invoices"
        action={
          <Button size="sm" variant="outline" tone="neutral">
            Try again
          </Button>
        }
      >
        The billing service didn't answer. The list may be out of date.
      </Alert>
      <Alert {...args} tone="neutral" title={undefined}>
        Usage data for this week is still arriving.
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
      <Alert {...args} variant="soft" tone="caution" title="Two invoices due this week">
        Northwind Studio ($2,120.00) on Tuesday, Brightline Labs ($960.00) on Friday.
      </Alert>
      <Alert {...args} variant="soft" tone="critical" title="Card payment failed">
        Your bank declined the $240.00 charge for the Team plan. Update the card to keep your seats.
      </Alert>
    </Stack>
  ),
}

export const Dismissible: Story = {
  args: {
    tone: 'positive',
    title: 'Invoice sent',
    children: 'Orchard & Co will get it by email, with a link to pay online.',
    onDismiss: () => undefined,
  },
}

/** Body only — for one-line notices under a table. */
export const WithoutTitle: Story = {
  args: { title: undefined, tone: 'neutral', children: 'Prices include GST.' },
}

/**
 * - `tone` is `neutral`, `info`, `positive`, `caution` or `critical`, and sets the glyph and its
 *   colour. Critical and caution alerts interrupt (`role="alert"`); the others are announced
 *   politely (`role="status"`).
 * - `variant="soft"` tints the box, for the rare alert that must shout.
 * - `action` puts one button beside the message, like "Try again".
 * - `onDismiss` adds a dismiss button (named with `dismissLabel`). You remove the alert.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [shown, setShown] = useState(true)
    return (
      <Stack gap={4}>
        <Alert
          tone="critical"
          title="Couldn't load live departures"
          action={
            <Button size="sm" variant="outline" tone="neutral">
              Try again
            </Button>
          }
        >
          The departures board didn't answer. Times below are from the printed timetable.
        </Alert>
        <Alert tone="caution" title="Kelso Bay Pier works">
          Boarding moves to berth 3 until Friday 17 October.
        </Alert>
        {shown ? (
          <Alert
            tone="info"
            variant="soft"
            onDismiss={() => {
              setShown(false)
            }}
          >
            Annual passes now include the night buses.
          </Alert>
        ) : null}
        <Alert tone="positive" title="Seat booked">
          Ferry to Kelso Bay, 07:10 tomorrow, seat 14C.
        </Alert>
      </Stack>
    )
  },
}
