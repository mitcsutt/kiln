import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { CheckboxField } from '#components/inputs/CheckboxField'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'UI/Inputs/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Paid', size: 'md', invalid: false, disabled: false },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: () => (
    <Inline gap={5}>
      <Checkbox aria-label="Unchecked" />
      <Checkbox aria-label="Checked" defaultChecked />
      <Checkbox aria-label="Some" checked="indeterminate" />
      <Checkbox aria-label="Invalid" invalid />
      <Checkbox aria-label="Disabled" disabled />
      <Checkbox aria-label="Disabled checked" disabled defaultChecked />
    </Inline>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Inline gap={5}>
      <Checkbox aria-label="Small" size="sm" defaultChecked />
      <Checkbox aria-label="Medium" size="md" defaultChecked />
      <Checkbox aria-label="Large" size="lg" defaultChecked />
    </Inline>
  ),
}

const bills = ['Rent', 'Electricity and gas', 'Internet', 'Phone plan']

/** A "select all" parent is indeterminate while some — not all — children are ticked. */
export const SelectAll: Story = {
  render: function SelectAllStory() {
    const [paid, setPaid] = useState<string[]>(['Rent', 'Internet'])
    const all = paid.length === bills.length
    return (
      <Stack gap={3}>
        <CheckboxField
          label="Mark all September bills paid"
          checked={all ? true : paid.length > 0 ? 'indeterminate' : false}
          onCheckedChange={(on) => {
            setPaid(on && !all ? bills : [])
          }}
        />
        <Stack gap={3} style={{ paddingInlineStart: 'var(--space-6)' }}>
          {bills.map((bill) => (
            <CheckboxField
              key={bill}
              label={bill}
              checked={paid.includes(bill)}
              onCheckedChange={(on) => {
                setPaid((p) => (on ? [...p, bill] : p.filter((b) => b !== bill)))
              }}
            />
          ))}
        </Stack>
      </Stack>
    )
  },
}
