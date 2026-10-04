import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fieldset } from '#components/inputs/Fieldset'
import { ChipGroup } from './ChipGroup'

const alerts = [
  { value: 'mentions', label: 'Mentions', count: 8 },
  { value: 'comments', label: 'Comments', count: 3 },
  { value: 'deploys', label: 'Deploys', count: 5 },
  { value: 'invoices', label: 'Invoices paid', count: 2 },
  { value: 'digest', label: 'Weekly digest', disabled: true },
]

const meta = {
  title: 'UI/Actions/ChipGroup',
  component: ChipGroup,
  args: {
    type: 'multiple',
    'aria-label': 'Email alerts',
    options: alerts,
    defaultValue: ['mentions', 'deploys'],
    size: 'md',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
} satisfies Meta<typeof ChipGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** The counts are how many members follow each alert. */
export const EmailAlerts: Story = {
  render: () => (
    <Fieldset legend="Email alerts" description="Sent to your inbox as they happen">
      <ChipGroup type="multiple" name="alerts" options={alerts} defaultValue={['mentions']} />
    </Fieldset>
  ),
}

/** At most one: pressing the chosen chip again clears it. */
export const Single: Story = {
  args: {
    type: 'single',
    'aria-label': 'Plan',
    options: ['Starter', 'Team', 'Business', 'Enterprise'].map((plan) => ({
      value: plan,
      label: plan,
    })),
    defaultValue: 'Team',
  },
}

export const Small: Story = { args: { size: 'sm' } }

export const Invalid: Story = {
  render: () => (
    <Fieldset legend="Email alerts" error="Pick at least one alert">
      <ChipGroup type="multiple" options={alerts} />
    </Fieldset>
  ),
}
