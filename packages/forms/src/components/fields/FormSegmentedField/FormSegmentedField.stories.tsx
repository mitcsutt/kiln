import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormSegmentedField } from './FormSegmentedField'

const periods = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

const meta = {
  title: 'Forms/Fields/SegmentedField',
  component: FormSegmentedField,
  args: { label: 'Report period' },
} satisfies Meta<typeof FormSegmentedField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: 'month' }} label="Sales report">
      {(form) => (
        <form.SegmentedField
          name="value"
          label="Report period"
          description="Totals reset at the start of each"
          options={periods}
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
            <FieldDemo defaultValues={{ value: null as string | number | null }}>
              {(form) => (
                <form.SegmentedField name="value" label="Report period" options={periods} />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: 'month' }}>
              {(form) => (
                <form.SegmentedField
                  name="value"
                  label="Report period"
                  description="Totals reset at the start of each"
                  options={periods}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | null }} reveal>
              {(form) => (
                <form.SegmentedField
                  name="value"
                  label="Report period"
                  options={periods}
                  required
                  validators={{ onDynamic: () => 'Pick a period to compare against' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 'year' }} reveal>
              {(form) => (
                <form.SegmentedField
                  name="value"
                  label="Report period"
                  options={periods}
                  warn={() => 'A year hides the quiet months'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 'quarter' }}>
              {(form) => (
                <form.SegmentedField
                  name="value"
                  label="Report period"
                  options={periods}
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 'quarter' }}>
              {(form) => (
                <form.SegmentedField
                  name="value"
                  label="Report period"
                  options={periods}
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 'quarter' }} reveal>
              {(form) => (
                <form.SegmentedField
                  name="value"
                  label="Report period"
                  options={periods}
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
    <StoryForm defaultValues={{ amount: 120000, period: 'month' }} label="Set a sales target">
      {(form) => (
        <>
          <form.AmountField name="amount" label="Target" currency="GBP" unit="minor" required />
          <form.SegmentedField name="period" label="Period" options={periods} />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 'month' }} mode="view" label="Report period">
      {(form) => <form.SegmentedField name="value" label="Report period" options={periods} />}
    </FieldDemo>
  ),
}
