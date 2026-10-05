import type { Meta, StoryObj } from '@storybook/react-vite'
import { toStandardSchema, type UntypedFormSchema } from '@mitcsutt/kiln-forms/schema'
import { Button, Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const meta = {
  title: 'Forms/Schema/Server validation',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const schema: UntypedFormSchema = {
  version: 1,
  root: {
    layout: 'stack',
    children: [
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        rules: [{ rule: 'required' }, { rule: 'email' }],
      },
      { kind: 'checkbox', name: 'contact', label: 'Contact me' },
      {
        kind: 'text',
        name: 'phone',
        label: 'Phone',
        when: { field: 'contact', op: 'truthy' },
        rules: [{ rule: 'required' }],
      },
    ],
  },
}

// React-free: this runs the same on a server, in an API handler, as it does here.
const validator = toStandardSchema(schema)

const BODY = { email: 'ines@example', contact: false, phone: '', isAdmin: true }

async function check(): Promise<string> {
  const outcome = await validator['~standard'].validate(BODY)
  return JSON.stringify(outcome.issues ?? { value: outcome.value })
}

/**
 * The phone field is hidden (contact is off), so it isn't validated, and `isAdmin` isn't a field,
 * so it's dropped from the output.
 *
 * ```ts title="api/feedback.ts"
 * import { parseFormSchema, toStandardSchema } from '@mitcsutt/kiln-forms/schema'
 *
 * export async function POST(request: Request) { const parsed = parseFormSchema(storedJson, {
 * kinds: ['text', 'checkbox'] }) if (!parsed.ok) throw new Error('Stored schema is invalid')
 *
 *   const result = await toStandardSchema(parsed.schema)['~standard'].validate(await request.json())
 *   if (result.issues) return Response.json({ issues: result.issues }, { status: 422 })
 *   await save(result.value)
 *   return new Response(null, { status: 204 })
 * }
 * ```
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [result, setResult] = useState('')
    return (
      <Stack gap={3} align="start">
        <Text>
          Request body: <Code>{JSON.stringify(BODY)}</Code>
        </Text>
        <Button
          variant="outline"
          tone="neutral"
          onClick={() => {
            void check().then(setResult)
          }}
        >
          Validate on the server
        </Button>
        {result ? <Code>{result}</Code> : null}
      </Stack>
    )
  },
}
