import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckboxGroupField } from '@mitcsutt/kiln-ui'

const notifications = [
  { value: 'mentions', label: 'Mentions', description: 'When someone tags you in a comment' },
  { value: 'assigned', label: 'Assigned tasks' },
  { value: 'releases', label: 'Release notes' },
]

const meta = {
  title: 'UI/Inputs/CheckboxGroupField',
  component: CheckboxGroupField,
  args: {
    label: 'Notify me about',
    description: 'Sent to the email on your workspace profile',
    options: notifications,
    name: 'notify',
    selectAllLabel: 'Everything',
    required: false,
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof CheckboxGroupField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = { args: { error: 'Choose at least one', required: true } }

export const WithWarning: Story = {
  args: {
    defaultValue: ['mentions', 'assigned', 'releases'],
    warning: 'That is about 40 emails a week during a release',
  },
}

export const Validating: Story = { args: { validating: true } }

/**
 * `selectAllLabel` adds a parent checkbox, and `columns` lays a long set out in a grid.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <CheckboxGroupField
        label="Alert me about"
        description="For your saved routes only"
        defaultValue={['delays']}
        options={[
          { value: 'delays', label: 'Delays over 5 minutes' },
          { value: 'platform', label: 'Berth changes' },
          { value: 'works', label: 'Planned works' },
        ]}
      />
    )
  },
}
