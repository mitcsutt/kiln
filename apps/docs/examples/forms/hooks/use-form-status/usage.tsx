'use client'

import { Form, SubmitButton, useAppForm, useFormStatus } from '@mitcsutt/kiln-forms'
import { DataList, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  const form = useAppForm({
    defaultValues: { route: 'Morning commute' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1000)),
  })
  const status = useFormStatus(form)
  return (
    <Form form={form} aria-label="Route">
      <Stack gap={5}>
        <form.TextField name="route" label="Route name" />
        <SubmitButton>Save</SubmitButton>
        <DataList>
          <DataList.Item label="Dirty">{String(status.isDirty)}</DataList.Item>
          <DataList.Item label="Submitting">{String(status.isSubmitting)}</DataList.Item>
          <DataList.Item label="Submitted">{String(status.isSubmitted)}</DataList.Item>
          <DataList.Item label="Submit count">{status.submitCount}</DataList.Item>
        </DataList>
      </Stack>
    </Form>
  )
}
