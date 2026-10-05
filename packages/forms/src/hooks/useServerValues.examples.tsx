import { Form, useAppForm, useServerValues } from '@mitcsutt/kiln-forms'
import { Button, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

interface Line {
  name: string
  frequency: number | null
}

export function Usage() {
  // Stands in for data from a query that refetches.
  const [server, setServer] = useState<Line>({ name: 'Coastal line', frequency: 20 })
  const form = useAppForm<Line>({ defaultValues: server })
  useServerValues(form, server)
  return (
    <Form form={form} aria-label="Line">
      <Stack gap={5}>
        <form.TextField name="name" label="Line name" />
        <form.NumberField name="frequency" label="Every (minutes)" min={5} />
        <Text size="sm" tone="muted">
          Edit the name, then refetch: the frequency updates, and your edit is kept.
        </Text>
        <Button
          variant="outline"
          tone="neutral"
          onClick={() => {
            setServer((line) => ({ ...line, frequency: (line.frequency ?? 20) === 20 ? 15 : 20 }))
          }}
        >
          Refetch from the server
        </Button>
      </Stack>
    </Form>
  )
}
