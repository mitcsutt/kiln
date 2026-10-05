import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormActions, ResetButton, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'
import { actionsFixture, actionsSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

const meta = {
  title: 'Forms/Layouts/FormActions',
  component: FormActions,
  args: { align: 'end', sticky: false, status: true, children: null },
} satisfies Meta<typeof FormActions>

export default meta
type Story = StoryObj<typeof meta>

/** The row that ends a form. Try `align`, `sticky` and `status`. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Project" defaultValues={{ name: 'Spring catalogue' }} hideActions>
      {(form) => (
        <>
          <form.TextField name="name" label="Project name" />
          <FormActions {...args}>
            <ResetButton>Discard changes</ResetButton>
            <SubmitButton>Save project</SubmitButton>
          </FormActions>
        </>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(actionsFixture, actionsSchema, [
  'FormActions',
  'ResetButton',
  'SubmitButton',
])

/**
 * A reset and a submit button at either end, with the form's status at the start.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { name: 'Coastal line' } })
    return (
      <Form form={form} aria-label="Line name">
        <Stack gap={5}>
          <form.TextField name="name" label="Line name" />
          <FormActions align="between" status>
            <ResetButton>Discard changes</ResetButton>
            <SubmitButton requireChanges>Save line</SubmitButton>
          </FormActions>
        </Stack>
      </Form>
    )
  },
}
