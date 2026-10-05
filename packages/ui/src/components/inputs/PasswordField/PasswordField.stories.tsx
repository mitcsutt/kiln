import type { Meta, StoryObj } from '@storybook/react-vite'
import { PasswordField, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/PasswordField',
  component: PasswordField,
  args: {
    label: 'Password',
    autoComplete: 'current-password',
    required: true,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '24rem' }}>
      <PasswordField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof PasswordField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const NewPassword: Story = {
  args: {
    label: 'New password',
    autoComplete: 'new-password',
    description: 'At least 12 characters. A short sentence is easier to remember.',
  },
}

export const WithError: Story = {
  args: {
    label: 'New password',
    autoComplete: 'new-password',
    defaultValue: 'atlas2026',
    error: 'Use at least 12 characters',
  },
}

/**
 * Describe the rules up front in `description`, rather than revealing them one error at a time.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={5}>
        <PasswordField label="Current password" autoComplete="current-password" />
        <PasswordField
          label="New password"
          autoComplete="new-password"
          description="At least 12 characters. A short sentence works well."
        />
      </Stack>
    )
  },
}
