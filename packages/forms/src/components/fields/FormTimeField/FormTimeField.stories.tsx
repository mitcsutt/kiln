import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormTimeField } from './FormTimeField'

const meta = {
  title: 'Forms/Fields/TimeField',
  component: FormTimeField,
  args: { label: 'Reminder time' },
} satisfies Meta<typeof FormTimeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '09:00' }} label="Daily reminder">
      {(form) => (
        <form.TimeField
          name="value"
          label="Reminder time"
          description="Sent on weekdays only"
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
              {(form) => <form.TimeField name="value" label="Reminder time" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.TimeField
                  name="value"
                  label="Reminder time"
                  description="Sent on weekdays only"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: '23:30' }} reveal>
              {(form) => (
                <form.TimeField
                  name="value"
                  label="Reminder time"
                  validators={{ onDynamic: () => 'Choose a time between 7am and 9pm' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: '06:00' }} reveal>
              {(form) => (
                <form.TimeField
                  name="value"
                  label="Reminder time"
                  warn={() => 'That is before most people wake up'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: '09:00' }}>
              {(form) => <form.TimeField name="value" label="Reminder time" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: '09:00' }}>
              {(form) => <form.TimeField name="value" label="Reminder time" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: '09:00' }} reveal>
              {(form) => (
                <form.TimeField
                  name="value"
                  label="Reminder time"
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
    <StoryForm defaultValues={{ enabled: true, time: '09:00' }} label="Reminders">
      {(form) => (
        <>
          <form.SwitchField
            name="enabled"
            label="Email me a daily task summary"
            description="Weekdays only"
          />
          <form.TimeField name="time" label="Reminder time" required />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: '09:00' }} mode="view" label="Reminder time">
      {(form) => <form.TimeField name="value" label="Reminder time" />}
    </FieldDemo>
  ),
}

/**
 * It renders kiln-ui's [TextField](/docs/ui/inputs/text-field) with `type="time"`. `step` is in
 * seconds.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { departs: '07:10' } })
    const value = useFieldValue(form, 'departs')
    return (
      <Form form={form} aria-label="TimeField example">
        <Stack gap={4}>
          <form.TimeField name="departs" label="Departs" step={300} />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
