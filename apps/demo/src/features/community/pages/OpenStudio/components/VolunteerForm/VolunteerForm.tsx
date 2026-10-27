import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'
import { toast } from '@mitcsutt/kiln-ui'

import { signUpVolunteer, type Volunteer } from '#features/community/data/openStudio'

const schema = defineFormSchema<Volunteer>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 4,
    children: [
      { kind: 'text', name: 'name', label: 'Your name', rules: [{ rule: 'required' }] },
      {
        kind: 'radio',
        name: 'shift',
        label: 'Shift',
        options: [
          { value: 'setup', label: 'Setting up, 4pm' },
          { value: 'evening', label: 'On the door, 6pm' },
          { value: 'packdown', label: 'Packing down, 10pm' },
        ],
        rules: [{ rule: 'required', message: 'Pick a shift' }],
      },
      { kind: 'checkbox', name: 'firstAid', label: 'I am a first aider' },
      { content: 'errorSummary' },
      { content: 'submit', label: 'Sign me up' },
    ],
  },
})

/** The whole form from one JSON schema, the shape a CMS could send. */
export function VolunteerForm() {
  const form = useAppForm<Volunteer>({
    defaultValues: { name: '', shift: null, firstAid: false },
    afterSubmit: 'reset',
    onSubmit: async ({ value }) => {
      await signUpVolunteer(value)
      toast({
        title: 'Thanks for volunteering',
        description: `${value.name}, see you there`,
        tone: 'positive',
      })
    },
  })
  return (
    <Form form={form} aria-label="Volunteer for open studio night">
      <SchemaForm form={form} schema={schema} />
    </Form>
  )
}
