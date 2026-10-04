import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { TagsInput } from './TagsInput'

const meta = {
  title: 'UI/Inputs/TagsInput',
  component: TagsInput,
  args: {
    'aria-label': 'Labels',
    placeholder: 'Add a label',
    defaultValue: ['Groceries', 'School'],
    maxTags: 8,
    normalise: 'trim',
    allowDuplicates: false,
    disabled: false,
    readOnly: false,
    invalid: false,
    size: 'md',
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <TagsInput {...args} />
    </Stack>
  ),
} satisfies Meta<typeof TagsInput>

export default meta
type Story = StoryObj<typeof meta>

/** Enter or comma adds; Backspace on an empty box removes the last; paste "Rent, Power, Internet". */
export const Playground: Story = {}

export const Labels: Story = {
  args: { defaultValue: ['Essentials', 'Holiday', 'Car', 'Gifts'] },
}

export const Empty: Story = {
  args: { defaultValue: [] },
}

/** Space, semicolon or comma separate email-style handles; lower-cased as they're added. */
export const CustomDelimiters: Story = {
  args: {
    'aria-label': 'Share with',
    placeholder: 'kofi@example.com',
    delimiters: [' ', ';', ',', 'Enter'],
    normalise: 'lowercase',
    defaultValue: ['ada@example.com'],
  },
}

export const ReadOnly: Story = {
  args: { readOnly: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Invalid: Story = {
  args: { invalid: true, defaultValue: [] },
}
