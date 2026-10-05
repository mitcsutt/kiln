import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ErrorSummary,
  Form,
  FormTab,
  FormTabs,
  SubmitButton,
  useAppForm,
} from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'
import { tabsFixture, tabsSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

const meta = {
  title: 'Forms/Layouts/FormTabs',
  component: FormTabs,
  args: { label: 'Workspace settings', children: null },
} satisfies Meta<typeof FormTabs>

export default meta
type Story = StoryObj<typeof meta>

/** Workspace settings across two tabs. A tab with an error in it is marked. Try `variant`. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm
      label="Workspace"
      defaultValues={{ workspaceName: 'Northwind', seats: 12, inviteEmail: '' }}
    >
      {(form) => (
        <FormTabs {...args}>
          <FormTab value="general" label="General">
            <form.TextField
              name="workspaceName"
              label="Workspace name"
              validators={{
                onDynamic: ({ value }) => (value.trim() === '' ? 'Name your workspace' : undefined),
              }}
            />
            <form.NumberField name="seats" label="Seats" min={0} />
          </FormTab>
          <FormTab value="members" label="Members">
            <form.TextField name="inviteEmail" label="Invite by email" type="email" />
          </FormTab>
        </FormTabs>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(tabsFixture, tabsSchema, [
  'FormTabs',
  'FormTabs.Tab',
])

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() ? undefined : message),
})

/**
 * Submit with everything empty: both tabs show a count, and the summary links switch tabs. `label`
 * names the tab list.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { name: '', email: '', stop: '', notes: '' } })
    return (
      <Form form={form} aria-label="New member">
        <Stack gap={5}>
          <ErrorSummary />
          <FormTabs label="Member details">
            <FormTab value="person" label="Person">
              <form.TextField name="name" label="Full name" validators={required('Enter a name')} />
              <form.TextField name="email" label="Email" validators={required('Enter an email')} />
            </FormTab>
            <FormTab value="travel" label="Travel">
              <form.TextField
                name="stop"
                label="Home stop"
                validators={required('Enter a home stop')}
              />
              <form.TextareaField name="notes" label="Notes" optional />
            </FormTab>
          </FormTabs>
          <SubmitButton>Add member</SubmitButton>
        </Stack>
      </Form>
    )
  },
}
