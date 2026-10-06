import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckboxField, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/CheckboxField',
  component: CheckboxField,
  args: {
    label: "I've read the workspace guidelines",
    description: "Guests can view shared projects but can't edit tasks or invite anyone else.",
    required: true,
    error: '',
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <CheckboxField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof CheckboxField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { error: 'Tick this to join the workspace' },
}

export const Checked: Story = {
  args: {
    label: 'Include in monthly report',
    description: undefined,
    required: false,
    defaultChecked: true,
  },
}

/**
 * For several related checkboxes, use a
 * [CheckboxGroupField](/docs/ui/inputs/checkbox-group-field), which gives the set one legend.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4}>
        <CheckboxField label="Email me my receipts" defaultChecked />
        <CheckboxField
          label="I've read the terms of carriage"
          description="Including the rules for bikes and dogs."
          required
          error="Accept the terms to book"
        />
      </Stack>
    )
  },
}
