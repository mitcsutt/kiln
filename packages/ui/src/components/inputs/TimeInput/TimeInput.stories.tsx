import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack, TimeInput } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Inputs/TimeInput',
  component: TimeInput,
  args: {
    'aria-label': 'Opens at',
    hourCycle: 24,
    granularity: 'minute',
    size: 'md',
    clearable: true,
    disabled: false,
    readOnly: false,
    invalid: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '14rem' }}>
      <TimeInput {...args} />
    </Stack>
  ),
} satisfies Meta<typeof TimeInput>

export default meta
type Story = StoryObj<typeof meta>

/** Type 0, 7, 3, 0 for 07:30, then step the minutes up with the arrow key. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('spinbutton', { name: 'Hour' }))
    await userEvent.keyboard('0730{ArrowUp}')
    await expect(canvas.getByRole('spinbutton', { name: 'Minute' })).toHaveTextContent('31')
  },
}

export const TwelveHour: Story = {
  args: { hourCycle: 12, defaultValue: '18:45' },
}

export const Seconds: Story = {
  args: { granularity: 'second', defaultValue: '23:59:58' },
}

export const OutOfHours: Story = {
  args: { min: '07:00', max: '22:00', defaultValue: '06:15' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '09:00' },
}

/**
 * The value is `HH:mm` on the 24-hour clock whichever clock it shows, so `14:30` round-trips
 * through a 12-hour display. `hourCycle` picks the clock; without it the locale decides. On a
 * 12-hour clock, type `a` or `p` in the last part.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={3}>
        <TimeInput aria-label="Doors open" defaultValue="19:30" hourCycle={12} />
        <TimeInput aria-label="Last entry" defaultValue="22:15" hourCycle={24} />
      </Stack>
    )
  },
}

/** `granularity="second"` adds seconds and keeps `HH:mm:ss`, for lap and log times. */
export const WithSeconds: Story = {
  tags: ['docs'],
  render: function WithSeconds() {
    return <TimeInput aria-label="Lap time" granularity="second" defaultValue="00:04:37" />
  },
}
