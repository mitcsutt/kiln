import type { Meta, StoryObj } from '@storybook/react-vite'
import { defineFormSchema, Form, SchemaForm, useAppForm } from '@mitcsutt/kiln-forms'

const meta = {
  title: 'Forms/Schema/Rules',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Signup {
  email: string
  username: string
  age: number | null
  stops: string[]
}

const schema = defineFormSchema<Signup>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { content: 'errorSummary' },
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        type: 'email',
        rules: [{ rule: 'required' }, { rule: 'email' }],
      },
      {
        kind: 'text',
        name: 'username',
        label: 'Username',
        rules: [
          { rule: 'minLength', value: 3 },
          { rule: 'maxLength', value: 20, message: 'Keep it under 20 characters' },
        ],
        // The same rules on the warning channel: advice that never blocks.
        warnRules: [
          { rule: 'maxLength', value: 12, message: 'Short usernames are easier to share' },
        ],
      },
      {
        kind: 'number',
        name: 'age',
        label: 'Age',
        rules: [
          { rule: 'min', value: 16, message: 'You need to be 16 or over' },
          { rule: 'integer' },
        ],
      },
      {
        kind: 'checkboxGroup',
        name: 'stops',
        label: 'Stops you use',
        options: [
          { value: 'harbour', label: 'Harbour Square' },
          { value: 'kelso', label: 'Kelso Bay Pier' },
          { value: 'marram', label: 'Marram Point' },
        ],
        rules: [{ rule: 'minItems', value: 1, message: 'Choose at least one stop' }],
      },
      { content: 'submit', label: 'Sign up' },
    ],
  },
})

/**
 * A sign-up form validated by the `rules` in its schema, with advice from `warnRules`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm<Signup>({
      defaultValues: { email: '', username: '', age: null, stops: [] },
    })
    return (
      <Form form={form} aria-label="Sign up">
        <SchemaForm form={form} schema={schema} />
      </Form>
    )
  },
}
