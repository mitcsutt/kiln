import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'

interface LostProperty {
  item: string
  route: string | null
  description: string
  contact: boolean
  email: string
}

const schema = defineFormSchema<LostProperty>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { content: 'heading', text: 'Report lost property', level: 3 },
      { kind: 'text', name: 'item', label: 'What did you lose?', rules: [{ rule: 'required' }] },
      {
        kind: 'select',
        name: 'route',
        label: 'Which route?',
        placeholder: 'Choose a route',
        options: [
          { value: 'coastal', label: 'Coastal line' },
          { value: 'harbour', label: 'Harbour loop' },
          { value: 'night', label: 'Night bus N14' },
        ],
        rules: [{ rule: 'required', message: 'Choose the route you were on' }],
      },
      {
        kind: 'textarea',
        name: 'description',
        label: 'Describe it',
        description: 'Colour, brand, anything inside',
      },
      { kind: 'checkbox', name: 'contact', label: 'Email me if it turns up' },
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        type: 'email',
        when: { field: 'contact', op: 'truthy' },
        rules: [{ rule: 'required' }, { rule: 'email' }],
      },
      { content: 'errorSummary' },
      { content: 'submit', label: 'Send report' },
    ],
  },
})

export function Usage() {
  const form = useAppForm<LostProperty>({
    defaultValues: { item: '', route: null, description: '', contact: false, email: '' },
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 500)),
  })
  return (
    <Form form={form} aria-label="Report lost property">
      <SchemaForm form={form} schema={schema} />
    </Form>
  )
}
