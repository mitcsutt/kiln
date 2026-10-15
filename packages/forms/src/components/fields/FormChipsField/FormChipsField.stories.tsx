import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormChipsField } from './FormChipsField'

const workshops = [
  { value: 'type', label: 'Type on screen' },
  { value: 'motion', label: 'Motion basics' },
  { value: 'research', label: 'Research in a week' },
  { value: 'a11y', label: 'Accessibility audits' },
]

const meta = {
  title: 'Forms/Fields/ChipsField',
  component: FormChipsField,
  args: { label: 'Workshops' },
} satisfies Meta<typeof FormChipsField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo
      defaultValues={{ value: ['type'] as readonly (string | number)[] }}
      label="Event registration"
    >
      {(form) => (
        <form.ChipsField
          name="value"
          label="Workshops"
          description="Friday afternoon, 40 places each"
          options={workshops}
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
              {(form) => <form.ChipsField name="value" label="Workshops" options={workshops} />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: ['type'] as readonly (string | number)[] }}>
              {(form) => (
                <form.ChipsField
                  name="value"
                  label="Workshops"
                  description="Friday afternoon, 40 places each"
                  options={workshops}
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
                <form.ChipsField
                  name="value"
                  label="Workshops"
                  options={workshops}
                  validators={{ onDynamic: () => 'Pick at least one workshop' }}
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
                value: ['type', 'motion', 'research', 'a11y'] as readonly (string | number)[],
              }}
              reveal
            >
              {(form) => (
                <form.ChipsField
                  name="value"
                  label="Workshops"
                  options={workshops}
                  warn={() => 'Some of these run at the same time'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: ['type'] as readonly (string | number)[] }}>
              {(form) => (
                <form.ChipsField name="value" label="Workshops" options={workshops} disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: ['type'] as readonly (string | number)[] }}>
              {(form) => (
                <form.ChipsField name="value" label="Workshops" options={workshops} readOnly />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: ['type'] as readonly (string | number)[] }} reveal>
              {(form) => (
                <form.ChipsField
                  name="value"
                  label="Workshops"
                  options={workshops}
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
      defaultValues={{ name: '', workshops: [] as readonly (string | number)[] }}
      label="Event registration"
      submitLabel="Register"
    >
      {(form) => (
        <>
          <form.TextField name="name" label="Your name" required />
          <form.ChipsField
            name="workshops"
            label="Workshops"
            description="Friday afternoon, 40 places each"
            options={workshops}
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
      defaultValues={{ value: ['type', 'research'] as readonly (string | number)[] }}
      mode="view"
      label="Workshops"
    >
      {(form) => <form.ChipsField name="value" label="Workshops" options={workshops} />}
    </FieldDemo>
  ),
}

/**
 * Exported as `FormChipsField`, named after its kind.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { days: ['mon', 'wed'] as string[] } })
    const value = useFieldValue(form, 'days')
    return (
      <Form form={form} aria-label="ChipsField example">
        <Stack gap={4}>
          <form.ChipsField
            name="days"
            label="Days you travel"
            options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => ({
              value: day.toLowerCase(),
              label: day,
            }))}
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}

/**
 * An option's `swatch` marks what it stands for: a categorical slot `1` to `8`, which follows the
 * theme in light and dark, or a CSS colour that comes from data. The chips draw it before the
 * label, and so do the tags the field shows in view mode. Colour marks who or what, never a
 * status, and the label still says it.
 */
export const Swatches: Story = {
  tags: ['docs'],
  render: function Swatches() {
    const form = useAppForm({ defaultValues: { teams: ['platform'] as string[] } })
    return (
      <Form form={form} aria-label="ChipsField swatches example">
        <form.ChipsField
          name="teams"
          label="Teams to notify"
          options={[
            { value: 'platform', label: 'Platform', swatch: 1 },
            { value: 'design', label: 'Design', swatch: 3 },
            { value: 'support', label: 'Support', swatch: 5 },
            { value: 'finance', label: 'Finance', swatch: 7 },
          ]}
        />
      </Form>
    )
  },
}
