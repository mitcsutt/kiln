import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormSliderField } from './FormSliderField'

const meta = {
  title: 'Forms/Fields/SliderField',
  component: FormSliderField,
  args: { label: 'Time for bug fixes' },
} satisfies Meta<typeof FormSliderField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: 20 }} label="Sprint settings">
      {(form) => (
        <form.SliderField
          name="value"
          label="Time for bug fixes"
          description="Share of each sprint kept free for bugs"
          max={50}
          step={5}
          showValue
          formatOptions={{ style: 'unit', unit: 'percent' }}
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
            <FieldDemo defaultValues={{ value: 20 }}>
              {(form) => (
                <form.SliderField
                  name="value"
                  label="Time for bug fixes"
                  max={50}
                  step={5}
                  showValue
                  formatOptions={{ style: 'unit', unit: 'percent' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: 20 }}>
              {(form) => (
                <form.SliderField
                  name="value"
                  label="Time for bug fixes"
                  description="Share of each sprint kept free for bugs"
                  max={50}
                  step={5}
                  showValue
                  formatOptions={{ style: 'unit', unit: 'percent' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: 50 }} reveal>
              {(form) => (
                <form.SliderField
                  name="value"
                  label="Time for bug fixes"
                  max={50}
                  step={5}
                  showValue
                  formatOptions={{ style: 'unit', unit: 'percent' }}
                  validators={{
                    onDynamic: () => 'Keep at least half of each sprint for planned work',
                  }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 45 }} reveal>
              {(form) => (
                <form.SliderField
                  name="value"
                  label="Time for bug fixes"
                  max={50}
                  step={5}
                  showValue
                  formatOptions={{ style: 'unit', unit: 'percent' }}
                  warn={() => 'That leaves little room for planned work'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 20 }}>
              {(form) => (
                <form.SliderField
                  name="value"
                  label="Time for bug fixes"
                  max={50}
                  step={5}
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
            <FieldDemo defaultValues={{ value: 20 }}>
              {(form) => (
                <form.SliderField
                  name="value"
                  label="Time for bug fixes"
                  max={50}
                  step={5}
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
            <FieldDemo defaultValues={{ value: 20 }} reveal>
              {(form) => (
                <form.SliderField
                  name="value"
                  label="Time for bug fixes"
                  max={50}
                  step={5}
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
      defaultValues={{ team: '', rate: 20 }}
      label="Sprint settings"
      submitLabel="Save settings"
    >
      {(form) => (
        <>
          <form.TextField name="team" label="Team" placeholder="Checkout" required />
          <form.SliderField
            name="rate"
            label="Time for bug fixes"
            max={50}
            step={5}
            showValue
            formatOptions={{ style: 'unit', unit: 'percent' }}
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 20 }} mode="view" label="Time for bug fixes">
      {(form) => (
        <form.SliderField
          name="value"
          label="Time for bug fixes"
          formatOptions={{ style: 'unit', unit: 'percent' }}
        />
      )}
    </FieldDemo>
  ),
}

/**
 * A slider always has a value. If "no answer" is a real state, a number field or a select is a
 * better fit.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { walk: 800 } })
    const value = useFieldValue(form, 'walk')
    return (
      <Form form={form} aria-label="SliderField example">
        <Stack gap={4}>
          <form.SliderField
            name="walk"
            label="Longest walk to a stop"
            min={200}
            max={2000}
            step={100}
            showValue
            formatOptions={{ style: 'unit', unit: 'meter' }}
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
