import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormColorField } from './FormColorField'

const labelColours = [
  { value: '#2f7d5c', label: 'Green' },
  { value: '#b5451b', label: 'Red' },
  { value: '#8a6d1f', label: 'Gold' },
  { value: '#3c5a73', label: 'Blue' },
]

const meta = {
  title: 'Forms/Fields/ColorField',
  component: FormColorField,
  args: { label: 'Label colour' },
} satisfies Meta<typeof FormColorField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '#2f7d5c' }} label="Edit label">
      {(form) => (
        <form.ColorField
          name="value"
          label="Label colour"
          description="Shown next to this label on the board"
          swatches={labelColours}
          swatchesOnly
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
              {(form) => (
                <form.ColorField
                  name="value"
                  label="Label colour"
                  swatches={labelColours}
                  swatchesOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '#2f7d5c' }}>
              {(form) => (
                <form.ColorField
                  name="value"
                  label="Label colour"
                  description="Shown next to this label on the board"
                  swatches={labelColours}
                  swatchesOnly
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
                <form.ColorField
                  name="value"
                  label="Label colour"
                  swatches={labelColours}
                  swatchesOnly
                  required
                  validators={{ onDynamic: () => 'Pick a colour for this label' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: '#b5451b' }} reveal>
              {(form) => (
                <form.ColorField
                  name="value"
                  label="Label colour"
                  swatches={labelColours}
                  swatchesOnly
                  warn={() => 'Red is already used by "Blocked"'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: '#2f7d5c' }}>
              {(form) => (
                <form.ColorField
                  name="value"
                  label="Label colour"
                  swatches={labelColours}
                  swatchesOnly
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: '#2f7d5c' }}>
              {(form) => (
                <form.ColorField
                  name="value"
                  label="Label colour"
                  swatches={labelColours}
                  swatchesOnly
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: '#2f7d5c' }} reveal>
              {(form) => (
                <form.ColorField
                  name="value"
                  label="Label colour"
                  swatches={labelColours}
                  swatchesOnly
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
    <StoryForm defaultValues={{ name: 'In review', colour: '#2f7d5c' }} label="Add a label">
      {(form) => (
        <>
          <form.TextField name="name" label="Label name" required />
          <form.ColorField
            name="colour"
            label="Colour"
            swatches={labelColours}
            swatchesOnly
            required
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: '#2f7d5c' }} mode="view" label="Label colour">
      {(form) => <form.ColorField name="value" label="Label colour" swatches={labelColours} />}
    </FieldDemo>
  ),
}

/**
 * View mode shows the matching swatch's name beside the hex code.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { lineColour: '#1f6f8b' } })
    const value = useFieldValue(form, 'lineColour')
    return (
      <Form form={form} aria-label="ColorField example">
        <Stack gap={4}>
          <form.ColorField
            name="lineColour"
            label="Line colour"
            swatches={[
              { value: '#1f6f8b', label: 'Harbour blue' },
              { value: '#2e8b57', label: 'Coastal green' },
              { value: '#c4553d', label: 'Signal red' },
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
