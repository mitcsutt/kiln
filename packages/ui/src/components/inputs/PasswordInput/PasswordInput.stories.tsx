import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Stack } from '#components/layout/Stack'
import { PasswordInput } from './PasswordInput'

const meta = {
  title: 'UI/Inputs/PasswordInput',
  component: PasswordInput,
  args: {
    'aria-label': 'Password',
    autoComplete: 'current-password',
    size: 'md',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '24rem' }}>
      <PasswordInput {...args} />
    </Stack>
  ),
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

/** The toggle shows the password and hides it again. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Password')
    await userEvent.type(input, 'harbour-lights-1450')
    await expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }))
    await expect(input).toHaveAttribute('type', 'text')
    await userEvent.click(canvas.getByRole('button', { name: 'Hide password' }))
    await expect(input).toHaveAttribute('type', 'password')
  },
}

export const Shown: Story = {
  args: { defaultValue: 'harbour-lights-1450', defaultVisible: true },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={3} style={{ maxInlineSize: '24rem' }}>
      <PasswordInput {...args} size="sm" aria-label="Password, small" />
      <PasswordInput {...args} size="md" aria-label="Password, medium" />
      <PasswordInput {...args} size="lg" aria-label="Password, large" />
    </Stack>
  ),
}
