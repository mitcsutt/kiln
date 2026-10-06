import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChipGroup, Fieldset } from '@mitcsutt/kiln-ui'

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

export const Small: Story = { args: { size: 'sm' } }

const ALERTS = [
  { value: 'delays', label: 'Delays', count: 12 },
  { value: 'platform', label: 'Platform changes', count: 4 },
  { value: 'cancellations', label: 'Cancellations', count: 2 },
  { value: 'works', label: 'Planned works' },
  { value: 'strikes', label: 'Industrial action', disabled: true },
]

/**
 * Several alerts from a set: `type="multiple"` inside a `Fieldset` that names the group.
 */
export const Multiple: Story = {
  tags: ['docs'],
  render: function Multiple() {
    return (
      <Fieldset legend="Service alerts" description="Sent to your phone for saved routes">
        <ChipGroup type="multiple" name="alerts" options={ALERTS} defaultValue={['delays']} />
      </Fieldset>
    )
  },
}

const ZONES = ['1', '2', '3', '4', '5'].map((zone) => ({ value: zone, label: `Zone ${zone}` }))

/**
 * At most one fare zone: pressing the chosen chip again clears it.
 */
export const Single: Story = {
  name: 'One of a set',
  tags: ['docs'],
  render: function Single() {
    return <ChipGroup type="single" aria-label="Fare zone" options={ZONES} defaultValue="2" />
  },
}

/**
 * Inside a `Fieldset` with an `error`, the chips take the critical edge and `aria-invalid`. Use
 * [ChipGroupField](/docs/ui/inputs/chip-group-field) for the label, description and error in one
 * component.
 */
export const Invalid: Story = {
  name: 'Errors',
  tags: ['docs'],
  render: function Invalid() {
    return (
      <Fieldset legend="Days you travel" error="Pick at least one day">
        <ChipGroup
          type="multiple"
          size="sm"
          options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
            value: day.toLowerCase(),
            label: day,
          }))}
        />
      </Fieldset>
    )
  },
}
