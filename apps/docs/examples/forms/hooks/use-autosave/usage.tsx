'use client'

import { Form, FormStatus, useAppForm, useAutosave } from '@mitcsutt/kiln-forms'
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'

function save(_values: unknown, { signal }: { signal: AbortSignal }) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 900)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Superseded'))
    })
  })
}

export default function Usage() {
  const form = useAppForm({ defaultValues: { title: 'Summer timetable', notes: '' } })
  const state = useAutosave(form, save, { debounceMs: 600 })
  return (
    <Form form={form} aria-label="Draft">
      <Stack gap={5}>
        <Inline justify="between">
          <Text weight="strong">Draft</Text>
          <FormStatus />
        </Inline>
        <form.TextField name="title" label="Title" />
        <form.TextareaField name="notes" label="Notes" autoResize />
        <Text size="sm" tone="muted">
          Autosave status: {state.status}
        </Text>
      </Stack>
    </Form>
  )
}
