import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormCheckboxGroupField } from './FormCheckboxGroupField'

const notifications = [
  { value: 'replies', label: 'Replies', description: 'When someone answers your comment' },
  { value: 'mentions', label: 'Mentions' },
  { value: 'digest', label: 'Weekly digest' },
]

const meta = {
  title: 'Forms/Fields/CheckboxGroupField',
  component: FormCheckboxGroupField,
  args: { label: 'Notify me about' },
} satisfies Meta<typeof FormCheckboxGroupField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo
      defaultValues={{ value: ['replies'] as readonly (string | number)[] }}
      label="Notifications"
    >
      {(form) => (
        <form.CheckboxGroupField
          name="value"
          label="Notify me about"
          description="Sent to the email on your account"
          options={notifications}
          selectAllLabel="Everything"
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
            <FieldDemo defaultValues={{ value: [] as readonly (string | number)[] }}>
              {(form) => (
                <form.CheckboxGroupField
                  name="value"
                  label="Notify me about"
                  options={notifications}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: ['replies'] as readonly (string | number)[] }}>
              {(form) => (
                <form.CheckboxGroupField
                  name="value"
                  label="Notify me about"
                  description="Sent to the email on your account"
                  options={notifications}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: [] as readonly (string | number)[] }} reveal>
              {(form) => (
                <form.CheckboxGroupField
                  name="value"
                  label="Notify me about"
                  options={notifications}
                  required
                  validators={{ onDynamic: () => 'Choose at least one' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo
              defaultValues={{
                value: ['replies', 'mentions', 'digest'] as readonly (string | number)[],
              }}
              reveal
            >
              {(form) => (
                <form.CheckboxGroupField
                  name="value"
                  label="Notify me about"
                  options={notifications}
                  warn={() => 'That is about 40 emails a week on a busy project'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: ['replies'] as readonly (string | number)[] }}>
              {(form) => (
                <form.CheckboxGroupField
                  name="value"
                  label="Notify me about"
                  options={notifications}
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: ['replies'] as readonly (string | number)[] }}>
              {(form) => (
                <form.CheckboxGroupField
                  name="value"
                  label="Notify me about"
                  options={notifications}
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo
              defaultValues={{ value: ['replies'] as readonly (string | number)[] }}
              reveal
            >
              {(form) => (
                <form.CheckboxGroupField
                  name="value"
                  label="Notify me about"
                  options={notifications}
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
      defaultValues={{ email: '', notify: ['replies'] as readonly (string | number)[] }}
      label="Notification preferences"
      submitLabel="Save preferences"
    >
      {(form) => (
        <>
          <form.TextField name="email" label="Email" type="email" autoComplete="email" required />
          <form.CheckboxGroupField
            name="notify"
            label="Notify me about"
            options={notifications}
            selectAllLabel="Everything"
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo
      defaultValues={{ value: ['replies', 'digest'] as readonly (string | number)[] }}
      mode="view"
      label="Notify me about"
    >
      {(form) => (
        <form.CheckboxGroupField name="value" label="Notify me about" options={notifications} />
      )}
    </FieldDemo>
  ),
}

/**
 * `selectAllLabel` adds a parent checkbox; `columns` lays a long list out in a grid.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { facilities: ['step-free'] as string[] } })
    const value = useFieldValue(form, 'facilities')
    return (
      <Form form={form} aria-label="CheckboxGroupField example">
        <Stack gap={4}>
          <form.CheckboxGroupField
            name="facilities"
            label="Facilities you need"
            selectAllLabel="All of them"
            options={[
              { value: 'step-free', label: 'Step-free access' },
              { value: 'toilets', label: 'Accessible toilets' },
              { value: 'hearing', label: 'Hearing loop' },
            ]}
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
