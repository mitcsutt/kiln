import type { Meta, StoryObj } from '@storybook/react-vite'
import { TagsInput } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/TagsInput',
  component: TagsInput,
  args: {
    'aria-label': 'Labels',
    placeholder: 'Add a label',
    defaultValue: ['Design', 'Frontend'],
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

/** Enter or comma adds; Backspace on an empty box removes the last; paste "Billing, Support, Docs". */
/** Enter adds a tag; each tag has its own remove button. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.type(canvas.getByRole('textbox', { name: /Labels/ }), 'Research{Enter}')
    await expect(canvas.getByRole('button', { name: 'Remove Research' })).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Design' }))
    await expect(canvas.queryByRole('button', { name: 'Remove Design' })).not.toBeInTheDocument()
  },
}

export const Labels: Story = {
  args: { defaultValue: ['Backend', 'Research', 'Urgent', 'Docs'] },
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

/**
 * `normalise` (`trim`, `lowercase` or `none`) cleans each tag, `allowDuplicates` permits repeats,
 * `maxTags` caps the count, and `onReject` tells you why a tag wasn't added.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <TagsInput
        aria-label="Route labels"
        defaultValue={['commute', 'weekend']}
        maxTags={5}
        normalise="lowercase"
        placeholder="Add a label"
      />
    )
  },
}
