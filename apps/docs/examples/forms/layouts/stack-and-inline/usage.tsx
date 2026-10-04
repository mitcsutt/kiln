'use client'

import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'

interface Search {
  query: string
  date: string
}

const schema = defineFormSchema<Search>()({
  version: 1,
  root: {
    layout: 'inline',
    gap: 3,
    align: 'end',
    children: [
      { kind: 'text', name: 'query', label: 'Stop or route', type: 'search' },
      { kind: 'date', name: 'date', label: 'Date' },
      { content: 'submit', label: 'Search' },
    ],
  },
})

export default function Usage() {
  const form = useAppForm<Search>({ defaultValues: { query: '', date: '' } })
  return (
    <Form form={form} aria-label="Search sailings">
      <SchemaForm form={form} schema={schema} />
    </Form>
  )
}
