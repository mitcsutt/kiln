import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormSwitchField } from './FormSwitchField'

const meta = {
  title: 'Forms/Fields/SwitchField',
  component: FormSwitchField,
  args: { label: 'Email me when a task is due' },
} satisfies Meta<typeof FormSwitchField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: true }} label="Notifications">
      {(form) => (
        <form.SwitchField
          name="value"
          label="Email me when a task is due"
          description="The morning before each due date"
        />
      )}
    </FieldDemo>
  ),
}

export const States: Story = {
  render: () => (
    <StatesGrid
      cells={[
        {
          title: 'Default',
          children: (
            <FieldDemo defaultValues={{ value: false }}>
              {(form) => <form.SwitchField name="value" label="Email me when a task is due" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: true }}>
              {(form) => (
                <form.SwitchField
                  name="value"
                  label="Email me when a task is due"
                  description="The morning before each due date"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: false }} reveal>
              {(form) => (
                <form.SwitchField
                  name="value"
                  label="Accept the community guidelines"
                  required
                  validators={{ onDynamic: () => 'Accept the guidelines to post' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: true }} reveal>
              {(form) => (
                <form.SwitchField
                  name="value"
                  label="Archive finished tasks after 30 days"
                  warn={() => 'Applies to tasks finished from now on'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: true }}>
              {(form) => (
                <form.SwitchField name="value" label="Email me when a task is due" disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: true }}>
              {(form) => (
                <form.SwitchField
                  name="value"
                  label="Sync with your calendar"
                  description="The calendar connection expired on 2 October"
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: true }} reveal>
              {(form) => (
                <form.SwitchField
                  name="value"
                  label="Email me when a task is due"
                  validators={{ onDynamicAsync: () => NEVER_SETTLES }}
                />
              )}
            </FieldDemo>
          ),
        },
      ]}
    />
  ),
}

export const InAForm: Story = {
  name: 'In a form',
  render: () => (
    <StoryForm
      defaultValues={{ taskDue: true, autoArchive: false, shareBoard: true }}
      label="Notification settings"
      submitLabel="Save settings"
    >
      {(form) => (
        <>
          <form.SwitchField
            name="taskDue"
            label="Email me when a task is due"
            description="The morning before"
          />
          <form.SwitchField
            name="autoArchive"
            label="Archive finished tasks after 30 days"
            description="Applies to tasks finished from now on"
          />
          <form.SwitchField name="shareBoard" label="Share this board with the design team" />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: true }} mode="view" label="Email me when a task is due">
      {(form) => <form.SwitchField name="value" label="Email me when a task is due" />}
    </FieldDemo>
  ),
}
