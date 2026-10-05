import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { projectLabels, countries } from '#components/inputs/Combobox/storyData'
import { ComboboxField } from './ComboboxField'

const meta = {
  title: 'UI/Inputs/ComboboxField',
  component: ComboboxField,
  args: {
    label: 'Country',
    description: 'Where your company is registered. Type "USA", "Holland" or "cote".',
    options: countries,
    placeholder: 'Search countries',
    clearable: true,
    required: true,
    error: '',
    disabled: false,
    size: 'md',
  },
  argTypes: { options: { control: false } },
  render: (args) => (
    <Stack style={{ maxInlineSize: '24rem' }}>
      <ComboboxField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof ComboboxField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { error: 'Choose a country' },
}

export const WithWarning: Story = {
  args: { defaultValue: 'ita', warning: 'Invoices to Italy need a VAT number.' },
}

export const Labels: Story = {
  render: () => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <ComboboxField
        label="Labels"
        description="Pick up to five, or type a new one"
        optional
        multiple
        creatable
        maxSelected={5}
        options={projectLabels}
        placeholder="Add a label"
        defaultValue={['design', 'frontend']}
      />
    </Stack>
  ),
}
