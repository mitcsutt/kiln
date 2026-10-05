import type { Meta, StoryObj } from '@storybook/react-vite'
import { OneTimeCodeInput, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

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

/**
 * `length` sets the number of cells, `validationType` limits what can be typed (`numeric` by
 * default), and `masked` hides the characters. The cells are a group, labelled by the surrounding
 * Field.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [done, setDone] = useState('')
    return (
      <Stack gap={3}>
        <OneTimeCodeInput aria-label="Verification code" length={6} onComplete={setDone} />
        <Text size="sm" tone="muted">
          {done ? `Checking ${done}` : 'Paste or type the code from the text message'}
        </Text>
      </Stack>
    )
  },
}
