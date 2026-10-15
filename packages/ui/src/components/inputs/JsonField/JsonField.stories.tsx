import type { Meta, StoryObj } from '@storybook/react-vite'
import { JsonField } from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor } from 'storybook/test'

const meta = {
  title: 'UI/Inputs/JsonField',
  component: JsonField,
  args: {
    label: 'Request body',
    description: 'Sent as JSON to the webhook URL',
    defaultValue: '{\n  "event": "invoice.paid",\n  "retry": 3\n}',
    minRows: 4,
    maxRows: 16,
    formatOnBlur: false,
    disabled: false,
  },
} satisfies Meta<typeof JsonField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * A syntax error shows as the field's error, with its line and column, once typing pauses or the
 * field loses focus. `formatOnBlur` tidies valid text as you leave.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <JsonField
        label="Feature flags"
        description="Keys are flag names; values are true or false."
        formatOnBlur
        defaultValue={'{\n  "new-checkout": true,\n  "route-sharing": false,\n}'}
      />
    )
  },
  play: async ({ canvas }) => {
    const area = canvas.getByRole('textbox', { name: /Feature flags/ })
    await userEvent.click(area)
    await userEvent.tab()
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Line 3, column 26: Remove this comma: nothing follows it',
    )
  },
}

/**
 * `validate` checks a value that parses and returns a message to reject it. A JSON Schema
 * validator goes here, so it stays your choice of library.
 */
export const OwnRules: Story = {
  tags: ['docs'],
  render: function OwnRules() {
    return (
      <JsonField
        label="Stops"
        description="A list of stop IDs, in order."
        defaultValue={'{"first": "ST-104"}'}
        validate={(value) =>
          Array.isArray(value) && value.every((stop) => typeof stop === 'string')
            ? undefined
            : 'Expected a list of stop IDs, like ["ST-104", "ST-221"]'
        }
      />
    )
  },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole('alert')).toHaveTextContent('Expected a list of stop IDs'),
    )
  },
}
