import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, within } from 'storybook/test'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm, storyRoot } from '#stories/_kit'
import { FormDateField } from './FormDateField'

const meta = {
  title: 'Forms/Fields/DateField',
  component: FormDateField,
  args: { label: 'Date' },
} satisfies Meta<typeof FormDateField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '2026-10-01' }} label="Submit an expense">
      {(form) => <form.DateField name="value" label="Date" required />}
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
              {(form) => <form.DateField name="value" label="Date" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.DateField
                  name="value"
                  label="Date"
                  description="The date printed on the receipt"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: '2027-01-01' }} reveal>
              {(form) => (
                <form.DateField
                  name="value"
                  label="Date"
                  max="2026-10-04"
                  validators={{ onDynamic: () => 'Choose a date up to today' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: '2026-08-01' }} reveal>
              {(form) => (
                <form.DateField
                  name="value"
                  label="Date"
                  warn={() => 'Expenses older than 60 days need a manager to approve them'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: '2026-10-01' }}>
              {(form) => <form.DateField name="value" label="Date" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: '2026-10-01' }}>
              {(form) => <form.DateField name="value" label="Date" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: '2026-10-01' }} reveal>
              {(form) => (
                <form.DateField
                  name="value"
                  label="Date"
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
    <StoryForm defaultValues={{ merchant: '', date: '2026-10-04' }} label="Submit an expense">
      {(form) => (
        <>
          <form.TextField
            name="merchant"
            label="Merchant"
            placeholder="Linden Street Café"
            required
          />
          <form.DateField name="date" label="Date" required />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: '2026-10-01' }} mode="view" label="Date">
      {(form) => <form.DateField name="value" label="Date" />}
    </FieldDemo>
  ),
}

export const CalendarPicker: Story = {
  name: 'Calendar picker',
  render: () => (
    <FieldDemo defaultValues={{ value: '2026-10-04' }} label="Submit an expense">
      {(form) => (
        <form.DateField
          name="value"
          label="Date"
          description="The date printed on the receipt"
          picker="calendar"
          max="2026-10-31"
          clearable
        />
      )}
    </FieldDemo>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('spinbutton', { name: 'Day' }))
    await userEvent.keyboard('15102026')
    await expect(canvas.getByRole('spinbutton', { name: 'Year' })).toHaveTextContent('2026')
    await userEvent.click(canvas.getByRole('button', { name: 'Choose date' }))
    await userEvent.click(await screen.findByRole('gridcell', { name: /20 October 2026/ }))
    await expect(canvas.getByRole('spinbutton', { name: 'Day' })).toHaveTextContent('20')
  },
}

/**
 * Dates are ISO strings, never `Date` objects: they survive JSON and don't drift across time
 * zones. It renders kiln-ui's [TextField](/docs/ui/inputs/text-field) with `type="date"`, so the
 * platform's own date picker does the work.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { travelDate: '' } })
    const value = useFieldValue(form, 'travelDate')
    return (
      <Form form={form} aria-label="DateField example">
        <Stack gap={4}>
          <form.DateField name="travelDate" label="Travel date" min="2026-10-01" />
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
 * [DateField](/docs/ui/inputs/date-field): the day, month and year typed in the locale's order,
 * and a calendar to pick from. The value is the same ISO date. Here `isDateDisabled` rules out
 * Sundays, in the calendar and when typed.
 */
export const WithACalendar: Story = {
  name: 'With a calendar',
  tags: ['docs'],
  render: function WithACalendar() {
    const form = useAppForm({ defaultValues: { travelDate: '' } })
    const value = useFieldValue(form, 'travelDate')
    return (
      <Form form={form} aria-label="DateField with a calendar example">
        <Stack gap={4}>
          <form.DateField
            name="travelDate"
            label="Travel date"
            description="No departures on Sundays"
            picker="calendar"
            min="2026-10-01"
            isDateDisabled={(date) => new Date(`${date}T00:00:00Z`).getUTCDay() === 0}
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
