'use client'

import {
  defineComputer,
  defineCustomNode,
  defineLoader,
  defineValidator,
  Form,
  kit,
} from '@mitcsutt/kiln-forms'
import { Alert } from '@mitcsutt/kiln-ui'

// Functions can't live in JSON, so the kit holds them and the schema names them.
const stops = defineLoader<string>(({ query }) =>
  Promise.resolve(
    ['Harbour Square', 'Kelso Bay Pier', 'Marram Point', 'Old Quay']
      .filter((stop) => stop.toLowerCase().includes(query.toLowerCase()))
      .map((stop) => ({ value: stop, label: stop })),
  ),
)
const bookingReference = defineValidator<string>((value) =>
  /^BAY-\w{3}$/.test(value) ? undefined : 'References look like BAY-40Q',
)
const total = defineComputer((values) => {
  const { adults, children } = values as { adults: number | null; children: number | null }
  return (adults ?? 0) * 4.2 + (children ?? 0) * 2.1
})
const notice = defineCustomNode<{ text: string }>(({ props }) => (
  <Alert tone="info">{props.text}</Alert>
))

const bay = kit.extend({
  loaders: { stops },
  validators: { bookingReference },
  computers: { total },
  nodes: { notice },
})

interface Change {
  reference: string
  stop: string | null
  adults: number | null
  children: number | null
  total: number | null
}

const schema = bay.defineFormSchema<Change>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { custom: 'notice', props: { text: 'Changes are free up to an hour before departure.' } },
      {
        kind: 'text',
        name: 'reference',
        label: 'Booking reference',
        rules: [{ rule: 'custom', validator: 'bookingReference' }],
      },
      {
        kind: 'combobox',
        name: 'stop',
        label: 'New boarding stop',
        optionsFrom: { loader: 'stops' },
      },
      { kind: 'number', name: 'adults', label: 'Adults', min: 0 },
      { kind: 'number', name: 'children', label: 'Children', min: 0 },
      {
        kind: 'amount',
        name: 'total',
        label: 'New total',
        currency: 'GBP',
        locale: 'en-GB',
        compute: { computer: 'total', from: ['adults', 'children'] },
      },
      { content: 'submit', label: 'Change booking' },
    ],
  },
})

export default function Registries() {
  const form = bay.useAppForm<Change>({
    defaultValues: { reference: '', stop: null, adults: 2, children: 1, total: 10.5 },
  })
  return (
    <Form form={form} aria-label="Change a booking">
      <bay.SchemaForm form={form} schema={schema} />
    </Form>
  )
}
