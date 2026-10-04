import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fieldset } from '#components/inputs/Fieldset'
import { ChipGroup } from './ChipGroup'

const alerts = [
  { value: 'goals', label: 'Goals', count: 8 },
  { value: 'first-red', label: 'Red cards', count: 3 },
  { value: 'own-goal', label: 'Own goal', count: 5 },
  { value: 'penalties', label: 'Penalty shoot-outs', count: 2 },
  { value: 'hat-trick', label: 'Hat-trick in the final', disabled: true },
]

const meta = {
  title: 'UI/Actions/ChipGroup',
  component: ChipGroup,
  args: {
    type: 'multiple',
    'aria-label': 'Match alerts',
    options: alerts,
    defaultValue: ['goals', 'own-goal'],
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
export const MatchAlerts: Story = {
  render: () => (
    <Fieldset legend="Match alerts" description="Sent to your phone during the match">
      <ChipGroup type="multiple" name="alerts" options={alerts} defaultValue={['goals']} />
    </Fieldset>
  ),
}

/** At most one: pressing the chosen chip again clears it. */
export const Single: Story = {
  args: {
    type: 'single',
    'aria-label': 'Group',
    options: ['A', 'B', 'C', 'D', 'E', 'F'].map((g) => ({ value: g, label: `Group ${g}` })),
    defaultValue: 'C',
  },
}

export const Small: Story = { args: { size: 'sm' } }

export const Invalid: Story = {
  render: () => (
    <Fieldset legend="Match alerts" error="Pick at least one alert">
      <ChipGroup type="multiple" options={alerts} />
    </Fieldset>
  ),
}
