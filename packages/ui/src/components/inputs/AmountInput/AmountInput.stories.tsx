import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { AmountInput } from './AmountInput'

const meta = {
  title: 'UI/Inputs/AmountInput',
  component: AmountInput,
  args: {
    'aria-label': 'Monthly rent',
    currency: 'GBP',
    locale: 'en-GB',
    unit: 'minor',
    defaultValue: 145000,
    showCurrency: 'symbol',
    allowNegative: false,
    size: 'md',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '20rem' }}>
      <AmountInput {...args} />
    </Stack>
  ),
} satisfies Meta<typeof AmountInput>

export default meta
type Story = StoryObj<typeof meta>

/** Monthly rent £1,450.00, held as 145000 pence. */
export const Playground: Story = {}

export const CurrencyDisplay: Story = {
  render: (args) => (
    <Stack gap={3} style={{ maxInlineSize: '20rem' }}>
      <AmountInput {...args} aria-label="Rent, symbol" showCurrency="symbol" />
      <AmountInput {...args} aria-label="Rent, code" showCurrency="code" />
      <AmountInput {...args} aria-label="Rent, both" showCurrency="both" />
      <AmountInput {...args} aria-label="Rent, none" showCurrency="none" />
    </Stack>
  ),
}

export const Currencies: Story = {
  render: () => (
    <Stack gap={3} style={{ maxInlineSize: '20rem' }}>
      <AmountInput aria-label="Groceries" currency="AUD" locale="en-AU" defaultValue={186.4} />
      <AmountInput
        aria-label="Rail pass"
        currency="JPY"
        locale="ja-JP"
        defaultValue={29650}
        showCurrency="both"
      />
      <AmountInput
        aria-label="Miete"
        currency="EUR"
        locale="de-DE"
        defaultValue={1234.5}
        showCurrency="code"
      />
    </Stack>
  ),
}

export const Refund: Story = {
  args: { 'aria-label': 'Adjustment', allowNegative: true, defaultValue: -2500 },
}
