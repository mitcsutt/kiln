import type { Meta, StoryObj } from '@storybook/react-vite'
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
