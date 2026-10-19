import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, within } from 'storybook/test'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm, storyRoot } from '#stories/_kit'
import { FormDateTimeField } from './FormDateTimeField'

const meta = {
  title: 'Forms/Fields/DateTimeField',
  component: FormDateTimeField,
  args: { label: 'Send at' },
} satisfies Meta<typeof FormDateTimeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }} label="Schedule a newsletter">
      {(form) => <form.DateTimeField name="value" label="Send at" required />}
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
              {(form) => <form.DateTimeField name="value" label="Send at" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.DateTimeField
                  name="value"
                  label="Send at"
                  description="Goes to 1,240 subscribers"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: '2025-01-01T09:00' }} reveal>
              {(form) => (
                <form.DateTimeField
                  name="value"
                  label="Send at"
                  min="2026-10-04T00:00"
                  validators={{ onDynamic: () => 'Choose a time in the future' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: '2026-11-01T23:30' }} reveal>
              {(form) => (
                <form.DateTimeField
                  name="value"
                  label="Send at"
                  warn={() => 'Fewer people open emails sent late at night'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }}>
              {(form) => <form.DateTimeField name="value" label="Send at" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }}>
              {(form) => <form.DateTimeField name="value" label="Send at" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }} reveal>
              {(form) => (
                <form.DateTimeField
                  name="value"
                  label="Send at"
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
      defaultValues={{ subject: 'What we shipped in October', scheduledFor: '2026-11-01T09:00' }}
      label="Schedule a newsletter"
    >
      {(form) => (
        <>
          <form.TextField name="subject" label="Subject" required />
          <form.DateTimeField name="scheduledFor" label="Send at" required />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }} mode="view" label="Send at">
      {(form) => <form.DateTimeField name="value" label="Send at" />}
    </FieldDemo>
  ),
}

export const CalendarPicker: Story = {
  name: 'Calendar picker',
  render: () => (
    <FieldDemo defaultValues={{ value: '2026-11-01T09:00' }} label="Schedule a newsletter">
      {(form) => (
        <form.DateTimeField name="value" label="Send at" picker="calendar" hourCycle={24} />
      )}
    </FieldDemo>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('button', { name: 'Choose date' }))
    await userEvent.click(await screen.findByRole('gridcell', { name: /12 November 2026/ }))
    await expect(canvas.getByRole('spinbutton', { name: 'Day' })).toHaveTextContent('12')
    await expect(canvas.getByRole('spinbutton', { name: 'Hour' })).toHaveTextContent('09')
  },
}

/**
 * It renders kiln-ui's [TextField](/docs/ui/inputs/text-field) with `type="datetime-local"`. The
 * value has no time zone: store the zone separately if it matters.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { pickup: '' } })
    const value = useFieldValue(form, 'pickup')
    return (
      <Form form={form} aria-label="DateTimeField example">
        <Stack gap={4}>
          <form.DateTimeField name="pickup" label="Pick-up time" />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}

/**
 * `picker="calendar"` swaps the native input for kiln-ui's
 * [DateTimeField](/docs/ui/inputs/date-time-field): the date and time typed part by part, in the
 * locale's order and on its clock, and a calendar for the day. The value is the same wall-clock
 * time as the native input's.
 */
export const WithACalendar: Story = {
  name: 'With a calendar',
  tags: ['docs'],
  render: function WithACalendar() {
    const form = useAppForm({ defaultValues: { pickup: '' } })
    const value = useFieldValue(form, 'pickup')
    return (
      <Form form={form} aria-label="DateTimeField with a calendar example">
        <Stack gap={4}>
          <form.DateTimeField
            name="pickup"
            label="Pick-up time"
            picker="calendar"
            min="2026-10-01T08:00"
            clearable
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
