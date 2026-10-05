import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Inputs/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Notes',
    placeholder: 'What was this for?',
    rows: 3,
    autoResize: false,
    invalid: false,
    disabled: false,
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

const width = { maxInlineSize: '28rem' }

export const Playground: Story = {
  render: (args) => (
    <Stack style={width}>
      <Textarea {...args} />
    </Stack>
  ),
}

/** Grows with its content from two rows up to six, then scrolls. Type to see it. */
export const AutoResize: Story = {
  render: () => (
    <Stack style={width}>
      <Textarea
        aria-label="Release notes"
        autoResize
        rows={2}
        maxRows={6}
        defaultValue="Invoices can now repeat weekly, fortnightly or monthly. Reminders go out three days after the due date, and every client gets a single link to pay online."
      />
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={4} style={width}>
      <Textarea
        aria-label="Invalid"
        defaultValue="Invoice for September and October"
        invalid
        rows={2}
      />
      <Textarea aria-label="Disabled" defaultValue="Imported from a CSV upload" disabled rows={2} />
    </Stack>
  ),
}

/**
 * A message that grows from two rows to six as it's typed.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Textarea
        aria-label="Message to the crew"
        placeholder="Anything the crew should know, like a wheelchair space or a large bag"
        autoResize
        rows={2}
        maxRows={6}
      />
    )
  },
}
