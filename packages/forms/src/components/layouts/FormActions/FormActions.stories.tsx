import type { Meta, StoryObj } from '@storybook/react-vite'
import { actionsFixture, actionsSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { ResetButton } from '#components/form/ResetButton'
import { SubmitButton } from '#components/form/SubmitButton'
import { StoryForm } from '#stories/_kit'
import { FormActions } from './FormActions'

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
