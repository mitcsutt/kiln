import type { Meta, StoryObj } from '@storybook/react-vite'
import { tabsFixture, tabsSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormTab, FormTabs } from './FormTabs'

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
