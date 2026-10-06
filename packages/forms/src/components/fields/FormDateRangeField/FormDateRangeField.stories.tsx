import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import type { DateRangeValue } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormDateRangeField } from './FormDateRangeField'

const EMPTY: DateRangeValue = { start: '', end: '' }
const SEPTEMBER: DateRangeValue = { start: '2026-09-01', end: '2026-09-30' }

const meta = {
  title: 'Forms/Fields/DateRangeField',
  component: FormDateRangeField,
  args: { label: 'Report period' },
} satisfies Meta<typeof FormDateRangeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: SEPTEMBER }} label="Export a report">
      {(form) => <form.DateRangeField name="value" label="Report period" required />}
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
            <FieldDemo defaultValues={{ value: EMPTY }}>
              {(form) => <form.DateRangeField name="value" label="Report period" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: SEPTEMBER }}>
              {(form) => (
                <form.DateRangeField
                  name="value"
                  label="Report period"
                  description="Covers full calendar months"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: { start: '2026-09-30', end: '2026-09-01' } }} reveal>
              {(form) => (
                <form.DateRangeField
                  name="value"
                  label="Report period"
                  validators={{ onDynamic: () => 'The period ends before it starts' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: { start: '2025-09-01', end: '2026-09-30' } }} reveal>
              {(form) => (
                <form.DateRangeField
                  name="value"
                  label="Report period"
                  warn={() => 'A full year of data can take a few minutes to export'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: SEPTEMBER }}>
              {(form) => <form.DateRangeField name="value" label="Report period" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: SEPTEMBER }}>
              {(form) => <form.DateRangeField name="value" label="Report period" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: SEPTEMBER }} reveal>
              {(form) => (
                <form.DateRangeField
                  name="value"
                  label="Report period"
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
      defaultValues={{ period: SEPTEMBER, format: 'csv' }}
      label="Export a report"
      submitLabel="Download"
    >
      {(form) => (
        <>
          <form.DateRangeField name="period" label="Report period" required />
          <form.SegmentedField
            name="format"
            label="File format"
            options={[
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF' },
            ]}
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: SEPTEMBER }} mode="view" label="Report period">
      {(form) => <form.DateRangeField name="value" label="Report period" />}
    </FieldDemo>
  ),
}

/**
 * Natively submitted, it sends `name.start` and `name.end`. View mode joins the two formatted
 * dates with an en dash.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { trip: { start: '', end: '' } } })
    const value = useFieldValue(form, 'trip')
    return (
      <Form form={form} aria-label="DateRangeField example">
        <Stack gap={4}>
          <form.DateRangeField
            name="trip"
            label="Travel dates"
            startLabel="First day"
            endLabel="Last day"
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
