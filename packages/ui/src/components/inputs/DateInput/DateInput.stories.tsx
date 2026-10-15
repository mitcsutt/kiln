import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateInput, Stack } from '@mitcsutt/kiln-ui'
import { expect, screen, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Inputs/DateInput',
  component: DateInput,
  args: {
    'aria-label': 'Due date',
    size: 'md',
    clearable: true,
    disabled: false,
    readOnly: false,
    invalid: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '18rem' }}>
      <DateInput {...args} />
    </Stack>
  ),
} satisfies Meta<typeof DateInput>

export default meta
type Story = StoryObj<typeof meta>

/** Type 15, 10, 2026: each part moves on when it's full. Then pick the 20th from the calendar. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('spinbutton', { name: 'Day' }))
    await userEvent.keyboard('15102026')
    await expect(canvas.getByRole('spinbutton', { name: 'Year' })).toHaveTextContent('2026')
    await userEvent.click(canvas.getByRole('button', { name: 'Choose date' }))
    await userEvent.click(await screen.findByRole('gridcell', { name: 'Tuesday 20 October 2026' }))
    await expect(canvas.getByRole('spinbutton', { name: 'Day' })).toHaveTextContent('20')
  },
}

export const Filled: Story = {
  args: { defaultValue: '2026-11-30' },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={3} style={{ maxInlineSize: '18rem' }}>
      <DateInput {...args} aria-label="Due date, small" size="sm" defaultValue="2026-11-30" />
      <DateInput {...args} aria-label="Due date, medium" size="md" defaultValue="2026-11-30" />
      <DateInput {...args} aria-label="Due date, large" size="lg" defaultValue="2026-11-30" />
    </Stack>
  ),
}

/** Before `min`: the box turns critical without any `error`. */
export const OutOfRange: Story = {
  args: { defaultValue: '2026-09-28', min: '2026-10-01' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '2026-11-30' },
}

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: '2026-11-30' },
}

/** The order of the parts follows the locale. */
export const Locales: Story = {
  render: (args) => (
    <Stack gap={3} style={{ maxInlineSize: '18rem' }}>
      <DateInput {...args} aria-label="en-AU" locale="en-AU" defaultValue="2026-11-30" />
      <DateInput {...args} aria-label="en-US" locale="en-US" defaultValue="2026-11-30" />
      <DateInput {...args} aria-label="ja-JP" locale="ja-JP" defaultValue="2026-11-30" />
    </Stack>
  ),
}

/**
 * The value is an ISO date (`2026-10-15`), and `''` until every part is filled in. `min`, `max`
 * and `isDateDisabled` rule dates out of the calendar and mark a typed one invalid. `clearable`
 * adds a clear button.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <DateInput
        aria-label="Delivery date"
        defaultValue="2026-10-22"
        min="2026-10-16"
        max="2026-12-18"
        clearable
      />
    )
  },
}

/**
 * `calendar={false}` drops the calendar button, for dates that are quicker typed than found,
 * such as a date of birth.
 */
export const TypedOnly: Story = {
  tags: ['docs'],
  render: function TypedOnly() {
    return <DateInput aria-label="Date of birth" calendar={false} max="2026-10-15" />
  },
}
