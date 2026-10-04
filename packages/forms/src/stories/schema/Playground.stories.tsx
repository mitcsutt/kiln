import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import {
  Alert,
  Code,
  CodeBlock,
  Heading,
  SegmentedControl,
  Split,
  Stack,
  Text,
  TextareaField,
} from '@mitcsutt/kiln-ui'
import { Form } from '#components'
import { kit } from '#kit'
import { parseFormSchema, schemaDefaultValues, type UntypedFormSchema } from '#schema'

/*
 * Schema playground (§16): edit JSON, and it goes through `parseFormSchema` against the default
 * kit's registry. Issues are listed with their exact path; a valid schema renders live through
 * `kit.SchemaForm`, and submitting shows the output.
 */

const refundRequest = {
  version: 1,
  title: 'Refund request',
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { content: 'heading', text: 'Request a refund', level: 2 },
      {
        layout: 'grid',
        columns: { base: 1, md: 2 },
        children: [
          {
            kind: 'text',
            name: 'orderNumber',
            label: 'Order number',
            description: 'On your confirmation email, e.g. FS-204518.',
            required: true,
            rules: [
              {
                rule: 'pattern',
                value: '^FS-\\d{6}$',
                message: 'Order numbers look like FS-204518',
              },
            ],
          },
          {
            kind: 'amount',
            name: 'amount',
            label: 'Amount paid',
            currency: 'GBP',
            locale: 'en-GB',
            rules: [{ rule: 'min', value: 1 }],
          },
        ],
      },
      {
        kind: 'radio',
        name: 'reason',
        label: 'What went wrong?',
        options: [
          { value: 'cancelled', label: 'The event was cancelled' },
          { value: 'duplicate', label: 'I was charged twice' },
          { value: 'other', label: 'Something else' },
        ],
        rules: [{ rule: 'required', message: 'Choose a reason' }],
      },
      {
        kind: 'textarea',
        name: 'details',
        label: 'Tell us what happened',
        when: { field: 'reason', op: 'eq', value: 'other' },
        rules: [{ rule: 'minLength', value: 20, message: 'A sentence or two, please' }],
      },
      {
        kind: 'switch',
        name: 'asCredit',
        label: 'Take it as credit instead',
        description: 'Credit is instant. Card refunds take 5 to 10 working days.',
      },
      { content: 'errorSummary' },
      { content: 'submit', label: 'Request refund' },
    ],
  },
}

/** The same form with five realistic mistakes — each one is reported at its exact path. */
const withMistakes = {
  version: 1,
  root: {
    layout: 'stack',
    children: [
      { kind: 'txt', name: 'orderNumber', label: 'Order number' },
      { layout: 'colums', children: [{ kind: 'amount', name: 'amount', label: 'Amount paid' }] },
      {
        kind: 'radio',
        label: 'What went wrong?',
        options: [{ value: 'other', label: 'Something else' }],
      },
      {
        kind: 'textarea',
        name: 'details',
        label: 'Details',
        rules: [{ rule: 'minLenght', value: 20 }],
      },
      {
        kind: 'switch',
        name: 'asCredit',
        label: 'Take it as credit',
        when: { field: 'reason', op: 'is', value: 'other' },
      },
    ],
  },
}

const PRESETS = {
  valid: JSON.stringify(refundRequest, null, 2),
  mistakes: JSON.stringify(withMistakes, null, 2),
} as const

/** The empty value per default field kind, for values the schema doesn't give a `defaultValue`. */
const EMPTIES: Readonly<Record<string, unknown>> = {
  text: '',
  textarea: '',
  password: '',
  hidden: '',
  color: '',
  date: '',
  time: '',
  dateTime: '',
  oneTimeCode: '',
  select: null,
  radio: null,
  segmented: null,
  choiceCards: null,
  combobox: null,
  number: null,
  amount: null,
  rating: null,
  checkbox: false,
  switch: false,
  checkboxGroup: [],
  multiChoiceCards: [],
  chips: [],
  multiSelect: [],
  tags: [],
  file: [],
  slider: 0,
  range: [0, 100],
  dateRange: { start: '', end: '' },
}

type Parsed =
  | { kind: 'json'; message: string }
  | { kind: 'issues'; issues: readonly { path: string; message: string }[] }
  | { kind: 'ok'; schema: UntypedFormSchema; key: string }

function parse(text: string): Parsed {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch (error) {
    return { kind: 'json', message: error instanceof Error ? error.message : String(error) }
  }
  // The author types this JSON in Storybook: a trusted source, so literal `pattern` rules are allowed.
  const result = parseFormSchema(json, { kinds: kit.registries.fields }, { allowPatterns: true })
  if (!result.ok) return { kind: 'issues', issues: result.issues }
  return { kind: 'ok', schema: result.schema, key: JSON.stringify(json) }
}

function LiveForm({ schema }: { schema: UntypedFormSchema }) {
  const [output, setOutput] = useState<unknown>(undefined)
  const form = kit.useAppForm<Record<string, unknown>>({
    defaultValues: schemaDefaultValues(schema, EMPTIES),
    afterSubmit: 'keep',
    onSubmit: ({ output: submitted }) => {
      setOutput(submitted)
    },
  })
  return (
    <Stack gap={6}>
      <Form form={form} aria-label={schema.title ?? 'Schema preview'}>
        <kit.SchemaForm form={form} schema={schema} />
      </Form>
      <CodeBlock
        title={output === undefined ? 'Not submitted yet' : 'Submitted output'}
        language="JSON"
        copyable={false}
        code={
          output === undefined
            ? '// Submit the form to see its output'
            : JSON.stringify(output, null, 2)
        }
      />
    </Stack>
  )
}

function Issues({ issues }: { issues: readonly { path: string; message: string }[] }) {
  return (
    <Stack gap={4}>
      <Alert
        tone="critical"
        title={
          issues.length === 1
            ? '1 problem in the schema'
            : `${String(issues.length)} problems in the schema`
        }
      >
        Nothing renders until the schema is valid.
      </Alert>
      <Stack as="ol" gap={3} dividers aria-label="Schema problems">
        {issues.map((issue) => (
          <Stack as="li" gap={1} key={`${issue.path}:${issue.message}`}>
            <Text weight="medium">{issue.message}</Text>
            <Text size="sm" tone="muted">
              at <Code>{issue.path === '' ? '(root)' : issue.path}</Code>
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

function Playground({ preset = 'valid' }: { preset?: keyof typeof PRESETS }) {
  const [text, setText] = useState<string>(PRESETS[preset])
  const [active, setActive] = useState<string>(preset)
  const parsed = useMemo(() => parse(text), [text])

  return (
    <Split ratio="5/7" gap={8} collapseBelow="lg">
      <Stack gap={4}>
        <Stack gap={2}>
          <Heading level={1} size="lg">
            Schema playground
          </Heading>
          <Text size="sm" tone="muted">
            Checked by <Code>parseFormSchema</Code> against the default kit as you type.
          </Text>
        </Stack>
        <SegmentedControl
          aria-label="Start from"
          size="sm"
          value={active}
          onValueChange={(next) => {
            setActive(next)
            setText(next === 'mistakes' ? PRESETS.mistakes : PRESETS.valid)
          }}
          options={[
            { value: 'valid', label: 'Refund request' },
            { value: 'mistakes', label: 'With mistakes' },
          ]}
        />
        <TextareaField
          label="Schema JSON"
          value={text}
          onValueChange={setText}
          rows={30}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </Stack>
      <Stack gap={4}>
        {parsed.kind === 'json' ? (
          <Alert tone="critical" title="Not valid JSON">
            {parsed.message}
          </Alert>
        ) : parsed.kind === 'issues' ? (
          <Issues issues={parsed.issues} />
        ) : (
          <LiveForm key={parsed.key} schema={parsed.schema} />
        )}
      </Stack>
    </Split>
  )
}

const meta = {
  title: 'Forms/Schema/Playground',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const RefundRequest: Story = {
  name: 'Refund request',
  render: () => <Playground />,
}

export const WithMistakes: Story = {
  name: 'With mistakes',
  render: () => <Playground preset="mistakes" />,
}
