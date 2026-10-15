import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field, JsonInput, Stack, Text, type JsonValidation } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'

const ROUTE = `{
  "route": "Ridge loop",
  "depot": "Kestrel Way",
  "stops": [
    { "id": "ST-104", "arrive": "07:40", "dwell": 6 },
    { "id": "ST-221", "arrive": "08:05", "dwell": 4 }
  ],
  "accessible": true,
  "fare": 3.50,
  "note": null
}`

const meta = {
  title: 'UI/Inputs/JsonInput',
  component: JsonInput,
  args: {
    defaultValue: ROUTE,
    indent: 2,
    minRows: 4,
    lineNumbers: true,
    wrap: false,
    toolbar: true,
    autoClose: true,
    formatOnBlur: false,
    sortKeys: false,
    readOnly: false,
    disabled: false,
    'aria-label': 'Route',
  },
} satisfies Meta<typeof JsonInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * It highlights with the theme's own colours, numbers the lines, and grows from `minRows` to
 * `maxRows`. Format and Minify keep numbers as written, so `3.50` stays `3.50`. `onValueChange`
 * gets the text and what it holds.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [stops, setStops] = useState(2)
    return (
      <Stack gap={3}>
        <Field label="Route">
          <JsonInput
            defaultValue={ROUTE}
            maxRows={16}
            onValueChange={(_, { parsed }) => {
              const route = parsed as { stops?: unknown } | undefined
              if (Array.isArray(route?.stops)) setStops(route.stops.length)
            }}
          />
        </Field>
        <Text size="sm" tone="muted">
          {stops} stops
        </Text>
      </Stack>
    )
  },
}

/**
 * Once typing pauses, the line with the error is marked and the input is invalid. It never
 * reformats text that isn't valid: Format says where to look instead.
 */
export const WithAnError: Story = {
  args: {
    defaultValue: '{\n  "route": "Ridge loop",\n  "stops": [4, 9,],\n  "fare": 3.50\n}',
  },
  play: async ({ canvas }) => {
    const area = canvas.getByRole('textbox', { name: 'Route' })
    await userEvent.click(canvas.getByRole('button', { name: 'Format' }))
    await expect(area).toHaveAttribute('aria-invalid', 'true')
    await expect(canvas.getByText('Fix the error on line 3 first')).toBeInTheDocument()
    await expect(area).toHaveValue(
      '{\n  "route": "Ridge loop",\n  "stops": [4, 9,],\n  "fare": 3.50\n}',
    )
  },
}

/**
 * The keyboard: Shift+Alt+F formats in place (and Undo takes it back), Tab indents, and Escape
 * then Tab leaves. The play function only presses keys the editor handles itself, because
 * Testing Library's simulated typing keeps its own copy of the value and loses track of edits the
 * browser makes.
 */
export const Keyboard: Story = {
  args: { defaultValue: '{"route": "Ridge loop", "stops": [3]}', minRows: 6 },
  play: async ({ canvas }) => {
    const area = canvas.getByRole<HTMLTextAreaElement>('textbox', { name: 'Route' })
    await userEvent.click(area)
    await userEvent.keyboard('{Shift>}{Alt>}F{/Alt}{/Shift}')
    await expect(area).toHaveValue('{\n  "route": "Ridge loop",\n  "stops": [\n    3\n  ]\n}')
    area.setSelectionRange(2, 2)
    await userEvent.keyboard('{Tab}')
    await expect(area).toHaveValue('{\n    "route": "Ridge loop",\n  "stops": [\n    3\n  ]\n}')
    await expect(area).toHaveFocus()
    await userEvent.keyboard('{Escape}{Tab}')
    await expect(area).not.toHaveFocus()
  },
}

/**
 * `readOnly` makes it a viewer: the text can be selected and copied, Tab moves on, and only the
 * Copy action shows. `wrap` wraps long lines instead of scrolling sideways.
 */
export const Viewer: Story = {
  tags: ['docs'],
  render: function Viewer() {
    return (
      <JsonInput
        aria-label="Webhook delivery"
        readOnly
        wrap
        minRows={3}
        defaultValue={
          '{"event": "invoice.paid", "invoice": "INV-2041", "amount": 1840.00, "currency": "NZD", "customer": {"name": "Harbourside Bakery", "email": "accounts@harbourside.example"}}'
        }
      />
    )
  },
}

/** `onValidationChange` reports what the input shows, after the pause, for a summary of your own. */
export const ValidationState: Story = {
  render: function ValidationState() {
    const [state, setState] = useState<JsonValidation>({ parsed: undefined, valid: true })
    return (
      <Stack gap={3}>
        <JsonInput aria-label="Route" defaultValue="[1, 2" onValidationChange={setState} />
        <Text size="sm" role="status">
          {state.valid ? 'Valid' : `Invalid: ${state.error?.message ?? ''}`}
        </Text>
      </Stack>
    )
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText(/Invalid: This array/)).toBeInTheDocument())
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}
