import {
  Form,
  kit,
  parseFormSchema,
  schemaDefaultValues,
  SchemaForm,
  useAppForm,
  type UntypedFormSchema,
} from '@mitcsutt/kiln-forms'
import { Alert, Code, CodeBlock, List, Split, Stack, TextareaField } from '@mitcsutt/kiln-ui'
import { useMemo, useState } from 'react'

const START = {
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { content: 'heading', text: 'Request a refund', level: 3 },
      {
        kind: 'text',
        name: 'reference',
        label: 'Booking reference',
        rules: [{ rule: 'required' }],
      },
      {
        kind: 'radio',
        name: 'reason',
        label: 'What went wrong?',
        options: [
          { value: 'cancelled', label: 'The sailing was cancelled' },
          { value: 'other', label: 'Something else' },
        ],
        rules: [{ rule: 'required', message: 'Choose a reason' }],
      },
      {
        kind: 'textarea',
        name: 'details',
        label: 'Tell us what happened',
        when: { field: 'reason', op: 'eq', value: 'other' },
      },
      { content: 'submit', label: 'Request refund' },
    ],
  },
}

// Values for kinds the schema gives no defaultValue.
const EMPTIES: Readonly<Record<string, unknown>> = {
  text: '',
  textarea: '',
  date: '',
  radio: null,
  select: null,
  segmented: null,
  number: null,
  amount: null,
  checkbox: false,
  switch: false,
  checkboxGroup: [],
  chips: [],
}

function LiveForm({ schema }: { schema: UntypedFormSchema }) {
  const [output, setOutput] = useState<unknown>(undefined)
  const form = useAppForm<Record<string, unknown>>({
    defaultValues: schemaDefaultValues(schema, EMPTIES),
    afterSubmit: 'keep',
    onSubmit: ({ value }) => {
      setOutput(value)
    },
  })
  return (
    <Stack gap={5}>
      <Form form={form} aria-label="Schema preview">
        <SchemaForm form={form} schema={schema} />
      </Form>
      {output === undefined ? null : (
        <CodeBlock title="Submitted" language="JSON" code={JSON.stringify(output, null, 2)} />
      )}
    </Stack>
  )
}

export function Usage() {
  const [text, setText] = useState(() => JSON.stringify(START, null, 2))
  const parsed = useMemo(() => {
    try {
      // You're typing this JSON yourself: a trusted source, so literal patterns are allowed.
      return parseFormSchema(
        JSON.parse(text),
        { kinds: Object.keys(kit.registries.fields) },
        { allowPatterns: true },
      )
    } catch (error) {
      return {
        ok: false as const,
        issues: [{ path: 'JSON', message: error instanceof Error ? error.message : 'Not JSON' }],
      }
    }
  }, [text])
  return (
    <Split ratio="1/1" gap={6} collapseBelow="lg">
      <TextareaField
        label="Schema"
        value={text}
        onValueChange={setText}
        rows={18}
        spellCheck={false}
      />
      {parsed.ok ? (
        <LiveForm key={text} schema={parsed.schema} />
      ) : (
        <Alert tone="critical" title="The schema doesn't parse">
          <List density="compact">
            {parsed.issues.map((issue) => (
              <List.Item key={issue.path + issue.message}>
                <List.Content>
                  <Code>{issue.path}</Code>
                  <List.Description>{issue.message}</List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Alert>
      )}
    </Split>
  )
}
