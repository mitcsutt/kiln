import type { Meta, StoryObj } from '@storybook/react-vite'
import { OneTimeCodeField } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/OneTimeCodeField',
  component: OneTimeCodeField,
  args: {
    label: 'Verification code',
    description: 'Sent by text to 0412 345 678',
    length: 6,
    required: true,
    disabled: false,
  },
} satisfies Meta<typeof OneTimeCodeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Expired: Story = {
  args: { defaultValue: '482913', error: 'That code has expired. We sent a new one.' },
}

export const Checking: Story = {
  args: { defaultValue: '482913', validating: true, readOnly: true },
}

/**
 * Say where the code was sent in the description, so the reader knows where to look.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <OneTimeCodeField
        label="Verification code"
        description="We sent six digits to the number ending 4417"
        length={6}
      />
    )
  },
}
