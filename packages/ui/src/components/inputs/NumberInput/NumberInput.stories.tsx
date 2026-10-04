import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Stack } from '#components/layout/Stack'
import { NumberInput } from './NumberInput'

const meta = {
  title: 'UI/Inputs/NumberInput',
  component: NumberInput,
  args: {
    'aria-label': 'Guests',
    defaultValue: 4,
    min: 1,
    max: 12,
    step: 1,
    stepper: true,
    size: 'md',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '16rem' }}>
      <NumberInput {...args} />
    </Stack>
  ),
} satisfies Meta<typeof NumberInput>

export default meta
type Story = StoryObj<typeof meta>

/** The stepper buttons move by `step` and stop at `min` and `max`. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('spinbutton', { name: 'Guests' })
    await userEvent.click(canvas.getByRole('button', { name: 'Increase' }))
    await expect(input).toHaveValue('5')
    await userEvent.click(canvas.getByRole('button', { name: 'Decrease' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Decrease' }))
    await expect(input).toHaveValue('3')
  },
}

/** Formatted when blurred, raw while focused. */
export const Decimal: Story = {
  args: {
    'aria-label': 'Distance',
    defaultValue: 1450.5,
    min: 0,
    max: undefined,
    step: 0.1,
    trailing: 'km',
  },
}

export const Percent: Story = {
  args: {
    'aria-label': 'Deposit',
    defaultValue: 0.2,
    min: 0,
    max: 1,
    step: 0.05,
    formatOptions: { style: 'percent' },
  },
}

export const German: Story = {
  args: {
    'aria-label': 'Betrag',
    locale: 'de-DE',
    defaultValue: 1234.5,
    min: undefined,
    max: undefined,
    step: 0.1,
  },
}

export const WithoutStepper: Story = {
  args: { stepper: false },
}
