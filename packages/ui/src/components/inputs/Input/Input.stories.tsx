import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input, SearchIcon, Stack } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Inputs/Input',
  component: Input,
  args: {
    'aria-label': 'Client',
    placeholder: 'Northwind Studio',
    size: 'md',
    invalid: false,
    numeric: false,
    disabled: false,
  },
  argTypes: { leading: { control: false }, trailing: { control: false } },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

const width = { maxInlineSize: '24rem' }

export const Playground: Story = {
  render: (args) => (
    <Stack style={width}>
      <Input {...args} />
    </Stack>
  ),
}

/** Units and currency sit inside the box. Money is right-aligned in the numeric face. */
export const Adornments: Story = {
  render: () => (
    <Stack gap={4} style={width}>
      <Input
        aria-label="Search invoices"
        type="search"
        leading={<SearchIcon />}
        placeholder="Search invoices"
      />
      <Input aria-label="Amount" numeric leading="$" trailing="AUD" defaultValue="1,240.00" />
      <Input aria-label="Discount" numeric trailing="%" defaultValue="18" />
      <Input aria-label="Website" leading="https://" defaultValue="example.com" />
    </Stack>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={4} style={width}>
      <Input aria-label="Small" size="sm" placeholder="Small — table filters" />
      <Input aria-label="Medium" size="md" placeholder="Medium — forms" />
      <Input aria-label="Large" size="lg" numeric leading="$" defaultValue="4,812.50" />
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={4} style={width}>
      <Input aria-label="Default" defaultValue="Fresh Market" />
      <Input aria-label="Invalid" defaultValue="kofi.example.com" invalid />
      <Input aria-label="Read only" defaultValue="062-000 1234 5678" readOnly />
      <Input aria-label="Disabled" defaultValue="Imported from the time tracker" disabled />
    </Stack>
  ),
}

/**
 * `leading` and `trailing` hold an icon, a currency or a unit inside the box. `numeric` sets
 * tabular figures, right alignment and `inputMode="decimal"`, for money and quantities. `htmlSize`
 * is the native `size` attribute (width in characters), since `size` is the control height.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4}>
        <Input
          aria-label="Search stops"
          placeholder="Search stops"
          leading={<SearchIcon />}
          type="search"
        />
        <Input aria-label="Fare" numeric leading="£" trailing="GBP" placeholder="0.00" />
        <Input aria-label="Booking reference" size="sm" defaultValue="BAY-40Q" />
        <Input aria-label="Booking reference" invalid defaultValue="BAY-4" />
      </Stack>
    )
  },
}
