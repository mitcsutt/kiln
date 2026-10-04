import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormRangeField } from './FormRangeField'

const rentFormat = { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 } as const

const meta = {
  title: 'Forms/Fields/RangeField',
  component: FormRangeField,
  args: { label: 'Rent range' },
} satisfies Meta<typeof FormRangeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo
      defaultValues={{ value: [1200, 2400] as [number, number] }}
      label="Set a search filter"
    >
      {(form) => (
        <form.RangeField
          name="value"
          label="Rent range"
          description="Monthly rent you could manage"
          min={500}
          max={5000}
          step={100}
          showValue
          formatOptions={rentFormat}
          locale="en-GB"
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
            <FieldDemo defaultValues={{ value: [1200, 2400] as [number, number] }}>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Rent range"
                  min={500}
                  max={5000}
                  step={100}
                  showValue
                  formatOptions={rentFormat}
                  locale="en-GB"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: [1200, 2400] as [number, number] }}>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Rent range"
                  description="Monthly rent you could manage"
                  min={500}
                  max={5000}
                  step={100}
                  showValue
                  formatOptions={rentFormat}
                  locale="en-GB"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: [500, 5000] as [number, number] }} reveal>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Rent range"
                  min={500}
                  max={5000}
                  step={100}
                  showValue
                  formatOptions={rentFormat}
                  locale="en-GB"
                  validators={{ onDynamic: () => 'The range is wider than any listing we have' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: [2800, 4500] as [number, number] }} reveal>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Rent range"
                  min={500}
                  max={5000}
                  step={100}
                  showValue
                  formatOptions={rentFormat}
                  locale="en-GB"
                  warn={() => 'Only two listings match a range this high'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: [1200, 2400] as [number, number] }}>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Rent range"
                  min={500}
                  max={5000}
                  step={100}
                  showValue
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: [1200, 2400] as [number, number] }}>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Rent range"
                  min={500}
                  max={5000}
                  step={100}
                  showValue
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: [1200, 2400] as [number, number] }} reveal>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Rent range"
                  min={500}
                  max={5000}
                  step={100}
                  showValue
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
      defaultValues={{ area: '', rent: [1200, 2400] as [number, number] }}
      label="Search filters"
      submitLabel="Search"
    >
      {(form) => (
        <>
          <form.TextField name="area" label="Area" placeholder="Hackney" required />
          <form.RangeField
            name="rent"
            label="Rent range"
            min={500}
            max={5000}
            step={100}
            showValue
            formatOptions={rentFormat}
            locale="en-GB"
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
      defaultValues={{ value: [1200, 2400] as [number, number] }}
      mode="view"
      label="Rent range"
    >
      {(form) => (
        <form.RangeField
          name="value"
          label="Rent range"
          formatOptions={rentFormat}
          locale="en-GB"
        />
      )}
    </FieldDemo>
  ),
}
