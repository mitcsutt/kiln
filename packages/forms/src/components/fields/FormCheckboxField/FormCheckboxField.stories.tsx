import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormCheckboxField } from './FormCheckboxField'

const meta = {
  title: 'Forms/Fields/CheckboxField',
  component: FormCheckboxField,
  args: { label: 'Mark as urgent' },
} satisfies Meta<typeof FormCheckboxField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: false }} label="Support request">
      {(form) => (
        <form.CheckboxField
          name="value"
          label="Mark as urgent"
          description="Urgent requests get a reply within four hours"
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
              {(form) => <form.CheckboxField name="value" label="Mark as urgent" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: false }}>
              {(form) => (
                <form.CheckboxField
                  name="value"
                  label="Mark as urgent"
                  description="Urgent requests get a reply within four hours"
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
                <form.CheckboxField
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
                <form.CheckboxField
                  name="value"
                  label="Mark as urgent"
                  warn={() => 'You already have three urgent requests open'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: true }}>
              {(form) => <form.CheckboxField name="value" label="Mark as urgent" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: true }}>
              {(form) => <form.CheckboxField name="value" label="Mark as urgent" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: true }} reveal>
              {(form) => (
                <form.CheckboxField
                  name="value"
                  label="Mark as urgent"
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
    <StoryForm defaultValues={{ subject: '', urgent: false }} label="Support request">
      {(form) => (
        <>
          <form.TextField
            name="subject"
            label="Subject"
            placeholder="Exports stop at 500 rows"
            required
          />
          <form.CheckboxField
            name="urgent"
            label="Mark as urgent"
            description="Urgent requests get a reply within four hours"
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: true }} mode="view" label="Mark as urgent">
      {(form) => <form.CheckboxField name="value" label="Mark as urgent" />}
    </FieldDemo>
  ),
}
