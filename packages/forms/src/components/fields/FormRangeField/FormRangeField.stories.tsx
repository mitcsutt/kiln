import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormRangeField } from './FormRangeField'

const rateFormat = { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 } as const

const meta = {
  title: 'Forms/Fields/RangeField',
  component: FormRangeField,
  args: { label: 'Day rate' },
} satisfies Meta<typeof FormRangeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo
      defaultValues={{ value: [400, 900] as [number, number] }}
      label="Set a search filter"
    >
      {(form) => (
        <form.RangeField
          name="value"
          label="Day rate"
          description="What you could pay a contractor per day"
          min={200}
          max={2000}
          step={50}
          showValue
          formatOptions={rateFormat}
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
            <FieldDemo defaultValues={{ value: [400, 900] as [number, number] }}>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Day rate"
                  min={200}
                  max={2000}
                  step={50}
                  showValue
                  formatOptions={rateFormat}
                  locale="en-GB"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: [400, 900] as [number, number] }}>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Day rate"
                  description="What you could pay a contractor per day"
                  min={200}
                  max={2000}
                  step={50}
                  showValue
                  formatOptions={rateFormat}
                  locale="en-GB"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: [200, 2000] as [number, number] }} reveal>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Day rate"
                  min={200}
                  max={2000}
                  step={50}
                  showValue
                  formatOptions={rateFormat}
                  locale="en-GB"
                  validators={{ onDynamic: () => 'The range is wider than any rate we list' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: [1400, 1800] as [number, number] }} reveal>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Day rate"
                  min={200}
                  max={2000}
                  step={50}
                  showValue
                  formatOptions={rateFormat}
                  locale="en-GB"
                  warn={() => 'Only two contractors charge this much'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: [400, 900] as [number, number] }}>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Day rate"
                  min={200}
                  max={2000}
                  step={50}
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
            <FieldDemo defaultValues={{ value: [400, 900] as [number, number] }}>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Day rate"
                  min={200}
                  max={2000}
                  step={50}
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
            <FieldDemo defaultValues={{ value: [400, 900] as [number, number] }} reveal>
              {(form) => (
                <form.RangeField
                  name="value"
                  label="Day rate"
                  min={200}
                  max={2000}
                  step={50}
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
      defaultValues={{ skill: '', rate: [400, 900] as [number, number] }}
      label="Contractor search"
      submitLabel="Search"
    >
      {(form) => (
        <>
          <form.TextField name="skill" label="Skill" placeholder="Product design" required />
          <form.RangeField
            name="rate"
            label="Day rate"
            min={200}
            max={2000}
            step={50}
            showValue
            formatOptions={rateFormat}
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
      defaultValues={{ value: [400, 900] as [number, number] }}
      mode="view"
      label="Day rate"
    >
      {(form) => (
        <form.RangeField name="value" label="Day rate" formatOptions={rateFormat} locale="en-GB" />
      )}
    </FieldDemo>
  ),
}

/**
 * Exported as `FormRangeField`, named after its kind.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { window: [7, 10] as [number, number] } })
    const value = useFieldValue(form, 'window')
    return (
      <Form form={form} aria-label="RangeField example">
        <Stack gap={4}>
          <form.RangeField
            name="window"
            label="Departure window"
            min={5}
            max={23}
            thumbLabels={['Earliest', 'Latest']}
            showValue
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
