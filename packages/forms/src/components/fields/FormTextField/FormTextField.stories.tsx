import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormTextField, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'

const meta = {
  title: 'Forms/Fields/TextField',
  component: FormTextField,
  args: { label: 'Project name' },
} satisfies Meta<typeof FormTextField>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A text field bound to `destination`, with the value it holds underneath.
 *
 * `type` (`text`, `email`, `tel`, `url` or `search`) sets the keyboard and autofill only.
 * Validation comes from your rules or schema, so `type="email"` doesn't check the address by
 * itself. A text field can't bind to a union like `'admin' | 'member'`: a text box would write
 * any string, so use a select, radio or segmented field.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { destination: '' } })
    const value = useFieldValue(form, 'destination')
    return (
      <Form form={form} aria-label="TextField example">
        <Stack gap={4}>
          <form.TextField
            name="destination"
            label="Destination"
            placeholder="Kelso Bay"
            autoComplete="off"
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '' }} label="Project name">
      {(form) => (
        <form.TextField
          name="value"
          label="Project name"
          placeholder="Spring catalogue redesign"
          required
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
              {(form) => <form.TextField name="value" label="Project name" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.TextField
                  name="value"
                  label="Project name"
                  description="Shown on the project card"
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
                <form.TextField
                  name="value"
                  label="Project name"
                  validators={{ onDynamic: () => 'Enter a project name' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 'Spring catalogue' }} reveal>
              {(form) => (
                <form.TextField
                  name="value"
                  label="Project name"
                  warn={() => 'Another project already uses this name'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 'Spring catalogue redesign' }}>
              {(form) => <form.TextField name="value" label="Project name" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 'Spring catalogue redesign' }}>
              {(form) => <form.TextField name="value" label="Project name" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 'Spring catalogue redesign' }} reveal>
              {(form) => (
                <form.TextField
                  name="value"
                  label="Project name"
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
    <StoryForm defaultValues={{ name: '', summary: '' }} label="New project">
      {(form) => (
        <>
          <form.TextField
            name="name"
            label="Project name"
            placeholder="Spring catalogue redesign"
            required
          />
          <form.TextareaField
            name="summary"
            label="One-line summary"
            description="Shown in the project list"
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
      defaultValues={{ value: 'Spring catalogue redesign' }}
      mode="view"
      label="Project name"
    >
      {(form) => <form.TextField name="value" label="Project name" />}
    </FieldDemo>
  ),
}
