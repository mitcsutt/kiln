'use client'

import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'

const STOPS = ['Harbour Square', 'Kelso Bay Pier', 'Marram Point', 'Northpoint Library', 'Old Quay']

// Called with the query, the form's values and an abort signal. Usually a fetch.
async function searchStops({ query, signal }: { query: string; signal: AbortSignal }) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 300)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Superseded'))
    })
  })
  return STOPS.filter((stop) => stop.toLowerCase().includes(query.toLowerCase())).map((stop) => ({
    value: stop,
    label: stop,
  }))
}

export default function Usage() {
  const form = useAppForm({ defaultValues: { stop: null as string | null } })
  const value = useFieldValue(form, 'stop')
  return (
    <Form form={form} aria-label="ComboboxField example">
      <Stack gap={4}>
        <form.ComboboxField
          name="stop"
          label="Stop"
          placeholder="Type a stop"
          loadOptions={searchStops}
          minQueryLength={1}
        />
        <Text size="sm" tone="muted">
          Value: <Code>{JSON.stringify(value)}</Code>
        </Text>
      </Stack>
    </Form>
  )
}
