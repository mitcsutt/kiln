import type { Meta, StoryObj } from '@storybook/react-vite'
import { Amount } from '#components/typography/Amount'
import { ChoiceCardsField } from './ChoiceCardsField'

const perYear = (n: number) => (
  <>
    <Amount value={n} currency="GBP" precision={0} /> a year
  </>
)

const plans = [
  {
    value: '5',
    label: '£5',
    description: 'One project, email support',
    meta: perYear(60),
  },
  {
    value: '10',
    label: '£10',
    description: 'Five projects, priority support',
    meta: perYear(120),
  },
  {
    value: '20',
    label: '£20',
    description: 'Unlimited projects, a named contact',
    meta: perYear(240),
  },
]

const meta = {
  title: 'UI/Inputs/ChoiceCardsField',
  component: ChoiceCardsField,
  args: {
    type: 'single',
    label: 'Plan',
    description: 'Billed monthly. Change or cancel any time.',
    options: plans,
    name: 'plan',
    columns: { base: 1, sm: 3 },
    required: true,
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof ChoiceCardsField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = { args: { error: 'Choose a plan to continue' } }
