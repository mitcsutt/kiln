import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckboxGroup } from '@mitcsutt/kiln-ui'
import { Fieldset } from '#components/inputs/Fieldset'

const notifications = [
  { value: 'mentions', label: 'Mentions', description: 'When someone tags you in a comment' },
  {
    value: 'assigned',
    label: 'Assigned tasks',
    description: 'When a task lands in your queue',
  },
  { value: 'releases', label: 'Release notes' },
  { value: 'digest', label: 'Weekly digest', description: 'Every Monday morning' },
]

const meta = {
  title: 'UI/Inputs/CheckboxGroup',
  component: CheckboxGroup,
  args: {
    'aria-label': 'Notify me about',
    options: notifications,
    defaultValue: ['mentions', 'releases'],
    orientation: 'vertical',
    size: 'md',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
} satisfies Meta<typeof CheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** "Everything" governs the list: ticking some of them shows the dash. */
export const NotifyMeAbout: Story = {
  render: () => (
    <Fieldset legend="Notify me about" description="Sent to the email on your workspace profile">
      <CheckboxGroup
        name="notify"
        options={notifications}
        defaultValue={['mentions']}
        selectAllLabel="Everything"
      />
    </Fieldset>
  ),
}

export const Columns: Story = {
  args: {
    'aria-label': 'Departments to notify',
    options: [
      { value: 'design', label: 'Design' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'support', label: 'Support' },
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'finance', label: 'Finance' },
    ],
    defaultValue: ['engineering', 'sales'],
    columns: { base: 1, sm: 2, md: 3 },
  },
}

export const Horizontal: Story = {
  args: {
    'aria-label': 'Stand-up days',
    options: [
      { value: 'mon', label: 'Monday' },
      { value: 'wed', label: 'Wednesday' },
      { value: 'fri', label: 'Friday' },
    ],
    defaultValue: ['fri'],
    orientation: 'horizontal',
  },
}

export const Invalid: Story = {
  render: () => (
    <Fieldset legend="Notify me about" error="Choose at least one">
      <CheckboxGroup options={notifications} />
    </Fieldset>
  ),
}

export const ReadOnly: Story = { args: { readOnly: true } }

export const Disabled: Story = { args: { disabled: true } }

/**
 * Facilities from a list of options, in two columns from `sm` up, with a select-all checkbox.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <CheckboxGroup
        aria-label="Facilities"
        columns={{ base: 1, sm: 2 }}
        selectAllLabel="All facilities"
        defaultValue={['step-free']}
        options={[
          { value: 'step-free', label: 'Step-free access' },
          { value: 'toilets', label: 'Toilets' },
          { value: 'bikes', label: 'Bike racks' },
          { value: 'cafe', label: 'Café', description: 'Open until 18:00' },
        ]}
      />
    )
  },
}
