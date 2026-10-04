import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormTextareaField } from './FormTextareaField'

const meta = {
  title: 'Forms/Fields/TextareaField',
  component: FormTextareaField,
  args: { label: 'Notes' },
} satisfies Meta<typeof FormTextareaField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '' }} label="Delivery">
      {(form) => (
        <form.TextareaField
          name="value"
          label="Notes"
          description="Printed on the delivery label"
          rows={3}
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
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => <form.TextareaField name="value" label="Notes" rows={3} />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.TextareaField
                  name="value"
                  label="Notes"
                  description="Printed on the delivery label"
                  rows={3}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: '' }} reveal>
              {(form) => (
                <form.TextareaField
                  name="value"
                  label="Notes"
                  rows={3}
                  validators={{ onDynamic: () => 'Add a note so the courier can find the door' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 'Porch' }} reveal>
              {(form) => (
                <form.TextareaField
                  name="value"
                  label="Notes"
                  rows={3}
                  warn={() => 'Last time you wrote "Porch, behind the bench"'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 'Porch, behind the bench' }}>
              {(form) => <form.TextareaField name="value" label="Notes" rows={3} disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 'Porch, behind the bench' }}>
              {(form) => <form.TextareaField name="value" label="Notes" rows={3} readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 'Porch, behind the bench' }} reveal>
              {(form) => (
                <form.TextareaField
                  name="value"
                  label="Notes"
                  rows={3}
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
    <StoryForm defaultValues={{ recipient: '', notes: '' }} label="Delivery details">
      {(form) => (
        <>
          <form.TextField name="recipient" label="Recipient" placeholder="Dana Whitlock" required />
          <form.TextareaField
            name="notes"
            label="Notes"
            description="Printed on the delivery label"
            rows={3}
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 'Porch, behind the bench' }} mode="view" label="Notes">
      {(form) => <form.TextareaField name="value" label="Notes" />}
    </FieldDemo>
  ),
}
