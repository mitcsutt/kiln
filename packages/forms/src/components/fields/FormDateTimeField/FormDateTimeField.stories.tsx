import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormDateTimeField } from './FormDateTimeField'

const meta = {
  title: 'Forms/Fields/DateTimeField',
  component: FormDateTimeField,
  args: { label: 'Send at' },
} satisfies Meta<typeof FormDateTimeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }} label="Schedule a newsletter">
      {(form) => <form.DateTimeField name="value" label="Send at" required />}
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
              {(form) => <form.DateTimeField name="value" label="Send at" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.DateTimeField
                  name="value"
                  label="Send at"
                  description="Goes to 1,240 subscribers"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: '2025-01-01T09:00' }} reveal>
              {(form) => (
                <form.DateTimeField
                  name="value"
                  label="Send at"
                  min="2026-10-04T00:00"
                  validators={{ onDynamic: () => 'Choose a time in the future' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: '2026-11-01T23:30' }} reveal>
              {(form) => (
                <form.DateTimeField
                  name="value"
                  label="Send at"
                  warn={() => 'Fewer people open emails sent late at night'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }}>
              {(form) => <form.DateTimeField name="value" label="Send at" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }}>
              {(form) => <form.DateTimeField name="value" label="Send at" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }} reveal>
              {(form) => (
                <form.DateTimeField
                  name="value"
                  label="Send at"
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
      defaultValues={{ subject: 'What we shipped in October', scheduledFor: '2026-11-01T09:00' }}
      label="Schedule a newsletter"
    >
      {(form) => (
        <>
          <form.TextField name="subject" label="Subject" required />
          <form.DateTimeField name="scheduledFor" label="Send at" required />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }} mode="view" label="Send at">
      {(form) => <form.DateTimeField name="value" label="Send at" />}
    </FieldDemo>
  ),
}
