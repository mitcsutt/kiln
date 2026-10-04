import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Textarea } from './Textarea'

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
        aria-label="Project summary"
        autoResize
        rows={2}
        maxRows={6}
        defaultValue="Redrew the city's transit map so every bus, ferry and tram line fits on one sheet. Interchanges now share one symbol, which took the median route-finding test from 40 seconds to under ten."
      />
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Stack gap={4} style={width}>
      <Textarea
        aria-label="Invalid"
        defaultValue="Rent for September and October"
        invalid
        rows={2}
      />
      <Textarea
        aria-label="Disabled"
        defaultValue="Imported from the bank feed"
        disabled
        rows={2}
      />
    </Stack>
  ),
}
