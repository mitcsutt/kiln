import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fieldset } from '#components/inputs/Fieldset'
import { Amount } from '#components/typography/Amount'
import { ChoiceCards } from './ChoiceCards'

const perYear = (n: number) => (
  <>
    <Amount value={n} currency="GBP" precision={0} /> a year
  </>
)

const plans = [
  { value: '5', label: '£5', description: 'One project, email support', meta: perYear(60) },
  { value: '10', label: '£10', description: 'Five projects, priority support', meta: perYear(120) },
  {
    value: '20',
    label: '£20',
    description: 'Unlimited projects, a named contact',
    meta: perYear(240),
  },
]

const meta = {
  title: 'UI/Inputs/ChoiceCards',
  component: ChoiceCards,
  args: {
    type: 'single',
    'aria-label': 'Plan',
    options: plans,
    defaultValue: '10',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
} satisfies Meta<typeof ChoiceCards>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** The yearly price sits under each card in tabular figures. */
export const Plans: Story = {
  render: () => (
    <Fieldset legend="Plan" description="Billed monthly. Change or cancel any time.">
      <ChoiceCards
        type="single"
        name="plan"
        options={plans}
        defaultValue="10"
        columns={{ base: 1, sm: 3 }}
      />
    </Fieldset>
  ),
}

export const Multiple: Story = {
  args: {
    type: 'multiple',
    'aria-label': 'Projects to invoice',
    options: [
      {
        value: 'atlas',
        label: 'Atlas redesign',
        description: 'Northwind Studio',
        meta: <Amount value={2184.5} />,
      },
      {
        value: 'billing',
        label: 'Billing migration',
        description: 'Brightline Labs',
        meta: <Amount value={12650} />,
      },
      {
        value: 'mobile',
        label: 'Mobile app',
        description: 'Orchard & Co',
        meta: <Amount value={3420} />,
      },
      {
        value: 'help-centre',
        label: 'Help centre',
        description: 'Archived in March',
        meta: <Amount value={0} />,
        disabled: true,
      },
    ],
    defaultValue: ['atlas'],
    columns: { base: 1, sm: 2 },
  },
}

export const Invalid: Story = {
  render: () => (
    <Fieldset legend="Plan" error="Choose a plan to continue">
      <ChoiceCards type="single" options={plans} />
    </Fieldset>
  ),
}

export const ReadOnly: Story = { args: { readOnly: true } }
