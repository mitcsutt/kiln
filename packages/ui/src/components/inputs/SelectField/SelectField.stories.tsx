import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { expenseCategories, countryGroups } from '#components/inputs/internal/storyData'
import { SelectField } from './SelectField'

const meta = {
  title: 'UI/Inputs/SelectField',
  component: SelectField,
  args: {
    label: 'Category',
    description: 'Used for the monthly breakdown',
    groups: expenseCategories,
    placeholder: 'Choose a category',
    required: true,
    error: '',
    disabled: false,
    size: 'md',
  },
  argTypes: { groups: { control: false }, options: { control: false } },
  render: (args) => (
    <Stack style={{ maxInlineSize: '22rem' }}>
      <SelectField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { error: 'Choose a category' },
}

export const Teams: Story = {
  args: {
    label: 'Country',
    description: 'Where your club is registered.',
    groups: countryGroups,
    placeholder: 'Choose a country',
    required: false,
    optional: true,
  },
}
