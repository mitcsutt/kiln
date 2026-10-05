import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text, type FileValue } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormFileField } from './FormFileField'

const avatar: readonly FileValue[] = [
  { id: 'avatar-1', name: 'imogen-hale.jpg', size: 184_000, type: 'image/jpeg' },
]

const meta = {
  title: 'Forms/Fields/FileField',
  component: FormFileField,
  args: { label: 'Avatar' },
} satisfies Meta<typeof FormFileField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: avatar }} label="Profile">
      {(form) => (
        <form.FileField
          name="value"
          label="Avatar"
          description="JPG or PNG, up to 5 MB"
          accept="image/*"
          maxFiles={1}
          maxSize={5_000_000}
          preview="thumbnails"
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
            <FieldDemo defaultValues={{ value: [] as readonly FileValue[] }}>
              {(form) => (
                <form.FileField
                  name="value"
                  label="Avatar"
                  accept="image/*"
                  maxFiles={1}
                  preview="thumbnails"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: avatar }}>
              {(form) => (
                <form.FileField
                  name="value"
                  label="Avatar"
                  description="JPG or PNG, up to 5 MB"
                  accept="image/*"
                  maxFiles={1}
                  preview="thumbnails"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: [] as readonly FileValue[] }} reveal>
              {(form) => (
                <form.FileField
                  name="value"
                  label="Avatar"
                  accept="image/*"
                  maxFiles={1}
                  preview="thumbnails"
                  required
                  validators={{ onDynamic: () => 'Add a photo' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: avatar }} reveal>
              {(form) => (
                <form.FileField
                  name="value"
                  label="Avatar"
                  accept="image/*"
                  maxFiles={1}
                  preview="thumbnails"
                  warn={() => 'Square photos crop best'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: avatar }}>
              {(form) => (
                <form.FileField
                  name="value"
                  label="Avatar"
                  accept="image/*"
                  maxFiles={1}
                  preview="thumbnails"
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: avatar }}>
              {(form) => (
                <form.FileField
                  name="value"
                  label="Avatar"
                  accept="image/*"
                  maxFiles={1}
                  preview="thumbnails"
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: avatar }} reveal>
              {(form) => (
                <form.FileField
                  name="value"
                  label="Avatar"
                  accept="image/*"
                  maxFiles={1}
                  preview="thumbnails"
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
      defaultValues={{ name: 'Imogen Hale', avatar }}
      label="Profile"
      submitLabel="Save profile"
    >
      {(form) => (
        <>
          <form.TextField name="name" label="Name" autoComplete="name" required />
          <form.FileField
            name="avatar"
            label="Avatar"
            description="JPG or PNG, up to 5 MB"
            accept="image/*"
            maxFiles={1}
            maxSize={5_000_000}
            preview="thumbnails"
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: avatar }} mode="view" label="Avatar">
      {(form) => <form.FileField name="value" label="Avatar" />}
    </FieldDemo>
  ),
}

/**
 * Upload in `onSubmit`, where you have the `File` objects. Files that were uploaded earlier come
 * back in as `StoredFile`s (`{ id, name, size, type }`), so an edit form can show what's already
 * saved. Files rejected for type, size or count become a field error.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { photo: [] as readonly FileValue[] } })
    const value = useFieldValue(form, 'photo')
    return (
      <Form form={form} aria-label="FileField example">
        <Stack gap={4}>
          <form.FileField
            name="photo"
            label="Photo for your pass"
            accept="image/jpeg,image/png"
            maxSize={5_000_000}
            preview="thumbnails"
          />
          <Text size="sm" tone="muted">
            Value:{' '}
            <Code>{value.length ? value.map((file) => file.name).join(', ') : 'No files'}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
