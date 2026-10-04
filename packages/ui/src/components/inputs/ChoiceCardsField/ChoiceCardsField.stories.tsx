import type { Meta, StoryObj } from '@storybook/react-vite'
import { Amount } from '#components/typography/Amount'
import { ChoiceCardsField } from './ChoiceCardsField'

const plans = [
  {
    value: '5',
    label: '£5',
    description: 'Pays out the top three',
    meta: <Amount value={40} currency="GBP" precision={0} />,
  },
  {
    value: '10',
    label: '£10',
    description: 'Pays out the top two',
    meta: <Amount value={80} currency="GBP" precision={0} />,
  },
  {
    value: '20',
    label: '£20',
    description: 'Winner takes all',
    meta: <Amount value={160} currency="GBP" precision={0} />,
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
