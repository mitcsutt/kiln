import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'

interface Booking {
  ticket: 'single' | 'return' | null
  returnDate: string
  group: number | null
  groupLeader: string
  promo: string
}

const schema = defineFormSchema<Booking, { member: boolean }>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      {
        kind: 'segmented',
        name: 'ticket',
        label: 'Ticket',
        options: [
          { value: 'single', label: 'Single' },
          { value: 'return', label: 'Return' },
        ],
      },
      // Shown only for returns.
      {
        kind: 'date',
        name: 'returnDate',
        label: 'Return date',
        when: { field: 'ticket', op: 'eq', value: 'return' },
      },
      { kind: 'number', name: 'group', label: 'Passengers', min: 1, max: 20 },
      // Required once the group is bigger than eight.
      {
        kind: 'text',
        name: 'groupLeader',
        label: 'Group leader',
        description: 'Required for groups of more than eight',
        requiredWhen: { field: 'group', op: 'gt', value: 8 },
      },
      // Locked unless the reader is a member, read from the render context.
      {
        kind: 'text',
        name: 'promo',
        label: 'Member code',
        disabledWhen: { not: { context: 'member', op: 'eq', value: true } },
      },
      { content: 'submit', label: 'Book' },
    ],
  },
})

export function Usage() {
  const form = useAppForm<Booking>({
    defaultValues: { ticket: 'single', returnDate: '', group: 2, groupLeader: '', promo: '' },
  })
  return (
    <Form form={form} aria-label="Book a sailing">
      <SchemaForm form={form} schema={schema} context={{ member: false }} />
    </Form>
  )
}
