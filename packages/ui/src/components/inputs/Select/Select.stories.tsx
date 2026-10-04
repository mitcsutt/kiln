import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { expenseCategories, periods, countryGroups } from '#components/inputs/internal/storyData'
import { Select } from './Select'

const meta = {
  title: 'UI/Inputs/Select',
  component: Select,
  args: {
    'aria-label': 'Pay period',
    options: periods,
    placeholder: 'Choose a period',
    size: 'md',
    invalid: false,
    disabled: false,
  },
  argTypes: { options: { control: false }, groups: { control: false } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const width = { maxInlineSize: '20rem', minBlockSize: '22rem' }

export const Playground: Story = {
  render: (args) => (
    <Stack style={width}>
      <Select {...args} />
    </Stack>
  ),
}

/** Open by default so the list is visible: groups, a disabled row, the check on the chosen one. */
export const Groups: Story = {
  render: () => (
    <Stack style={width}>
      <Select aria-label="Category" groups={expenseCategories} defaultValue="rent" defaultOpen />
    </Stack>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={4} style={{ maxInlineSize: '20rem' }}>
      <Select aria-label="Small" size="sm" options={periods} defaultValue="weekly" />
      <Select aria-label="Medium" size="md" options={periods} defaultValue="fortnightly" />
      <Select aria-label="Large" size="lg" options={periods} defaultValue="monthly" />
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={4} style={{ maxInlineSize: '20rem' }}>
      <Select aria-label="Placeholder" options={periods} placeholder="Choose a period" />
      <Select aria-label="Invalid" options={periods} placeholder="Choose a period" invalid />
      <Select aria-label="Disabled" options={periods} defaultValue="monthly" disabled />
    </Stack>
  ),
}

/** The compound parts, for custom rows or content the simple API can't express. */
export const Compound: Story = {
  render: () => (
    <Stack style={width}>
      <Select.Root defaultValue="aus">
        <Select.Trigger aria-label="Team" />
        <Select.Content>
          {countryGroups.map((group) => (
            <Select.Group key={group.label}>
              <Select.Label>{group.label}</Select.Label>
              {group.options.map((team) => (
                <Select.Item key={team.value} value={team.value}>
                  {team.label}
                </Select.Item>
              ))}
            </Select.Group>
          ))}
        </Select.Content>
      </Select.Root>
    </Stack>
  ),
}
