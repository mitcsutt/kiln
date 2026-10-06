import type { Meta, StoryObj } from '@storybook/react-vite'
import { TagsField } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/TagsField',
  component: TagsField,
  args: {
    label: 'Labels',
    description: 'Press Enter or comma to add. Used to filter reports.',
    placeholder: 'Add a label',
    defaultValue: ['Backend', 'Frontend'],
    maxTags: 8,
    error: '',
    required: false,
    optional: true,
    disabled: false,
  },
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <TagsField {...args} />
    </Stack>
  ),
} satisfies Meta<typeof TagsField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { defaultValue: [], error: 'Add at least one label', optional: false, required: true },
}

export const Horizontal: Story = {
  args: { layout: 'horizontal' },
}

/**
 * Say how to add a tag in the description: not everyone knows Enter or a comma works.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <TagsField
        label="Labels"
        description="Press Enter or a comma to add one"
        defaultValue={['commute']}
        maxTags={5}
        normalise="lowercase"
      />
    )
  },
}
