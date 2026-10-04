import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { OneTimeCodeInput } from './OneTimeCodeInput'

const meta = {
  title: 'UI/Inputs/OneTimeCodeInput',
  component: OneTimeCodeInput,
  args: {
    'aria-label': 'Verification code',
    length: 6,
    validationType: 'numeric',
    masked: false,
    size: 'md',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
} satisfies Meta<typeof OneTimeCodeInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Filled: Story = {
  args: { defaultValue: '482913' },
}

export const FourDigitPin: Story = {
  args: { 'aria-label': 'Card PIN', length: 4, masked: true },
}

export const RecoveryCode: Story = {
  args: {
    'aria-label': 'Recovery code',
    length: 8,
    validationType: 'alphanumeric',
    defaultValue: 'K7PQ',
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={4}>
      <OneTimeCodeInput {...args} size="sm" aria-label="Code, small" />
      <OneTimeCodeInput {...args} size="md" aria-label="Code, medium" />
      <OneTimeCodeInput {...args} size="lg" aria-label="Code, large" />
    </Stack>
  ),
}
