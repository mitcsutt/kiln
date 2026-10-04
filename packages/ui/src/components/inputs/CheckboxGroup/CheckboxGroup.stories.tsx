import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fieldset } from '#components/inputs/Fieldset'
import { CheckboxGroup } from './CheckboxGroup'

const notifications = [
  { value: 'goals', label: 'Goals', description: 'When a team you drew scores' },
  {
    value: 'kickoffs',
    label: 'Kick-offs',
    description: 'Fifteen minutes before each of your matches',
  },
  { value: 'results', label: 'Full-time results' },
  { value: 'standings', label: 'Weekly table', description: 'Every Monday morning' },
]

const meta = {
  title: 'UI/Inputs/CheckboxGroup',
  component: CheckboxGroup,
  args: {
    'aria-label': 'Notify me about',
    options: notifications,
    defaultValue: ['goals', 'results'],
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
    <Fieldset legend="Notify me about" description="Sent to the email on your club registration">
      <CheckboxGroup
        name="notify"
        options={notifications}
        defaultValue={['goals']}
        selectAllLabel="Everything"
      />
    </Fieldset>
  ),
}

export const Columns: Story = {
  args: {
    'aria-label': 'Categories to track',
    options: [
      { value: 'groceries', label: 'Groceries' },
      { value: 'rent', label: 'Rent' },
      { value: 'power', label: 'Electricity and gas' },
      { value: 'fuel', label: 'Fuel' },
      { value: 'eating-out', label: 'Eating out' },
      { value: 'gym', label: 'Gym membership' },
    ],
    defaultValue: ['rent', 'fuel'],
    columns: { base: 1, sm: 2, md: 3 },
  },
}

export const Horizontal: Story = {
  args: {
    'aria-label': 'Days paid',
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
