import { toStandardSchema, type UntypedFormSchema } from '@mitcsutt/kiln-forms/schema'
import { Button, Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

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

export function Usage() {
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
}
