import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { SwitchField } from './SwitchField'

const meta = {
  title: 'UI/Inputs/SwitchField',
  component: SwitchField,
  args: {
    label: 'Email me when an invoice is due',
    description: 'Three days before the 1st of each month',
    defaultChecked: true,
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <SwitchField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof SwitchField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A settings list: label and help on the left, the switch at the end of each row. */
export const SettingsList: Story = {
  render: () => (
    <Stack gap={5} dividers style={{ maxInlineSize: '28rem' }}>
      <SwitchField
        label="Email me when an invoice is due"
        description="Three days before the 1st"
        defaultChecked
      />
      <SwitchField
        label="Round invoice totals to the nearest pound"
        description="Applies to new invoices only"
      />
      <SwitchField label="Share this project with Amara" defaultChecked />
      <SwitchField
        label="Sync with your calendar"
        description="Your calendar connection expired on 2 October"
        readOnly
      />
    </Stack>
  ),
}

export const WithError: Story = {
  args: {
    label: 'Accept the terms of service',
    description: undefined,
    defaultChecked: false,
    required: true,
    error: 'Accept the terms to create your workspace',
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}
