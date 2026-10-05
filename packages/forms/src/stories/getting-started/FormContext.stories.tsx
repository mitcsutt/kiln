import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Form,
  formOptions,
  FormSection,
  SubmitButton,
  useAppForm,
  useFieldValue,
  useFormStatus,
  useTypedAppFormContext,
} from '@mitcsutt/kiln-forms'
import { Alert, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState, type ReactNode } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { kit } from '#kit/defaultKit'

/*
 * A workshop booking whose fields and readers sit several components below the form. None of
 * them takes a `form` prop: each reads the form from context, typed by the shared options.
 */

const meta = {
  title: 'Forms/Getting started/Form context',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function WorkbenchAttendeeFields() {
  const form = kit.useTypedAppFormContext(bookingOptions)
  return (
    <>
      <form.TextField name="attendee.name" label="Full name" autoComplete="name" />
      <form.TextField name="attendee.email" label="Email" type="email" autoComplete="email" />
    </>
  )
}

function WorkbenchSessionFields() {
  const form = kit.useTypedAppFormContext(bookingOptions)
  return (
    <>
      <form.SegmentedField
        name="session"
        label="Session"
        options={[
          { value: 'morning', label: 'Morning' },
          { value: 'afternoon', label: 'Afternoon' },
        ]}
      />
      <form.NumberField name="seats" label="Seats" min={1} max={6} />
    </>
  )
}

function WorkbenchSummary() {
  const form = kit.useTypedAppFormContext(bookingOptions)
  const seats = useFieldValue(form, 'seats')
  const session = useFieldValue(form, 'session')
  return (
    <Text aria-live="polite" data-testid="summary">
      {seats} {seats === 1 ? 'seat' : 'seats'}, {session} session
    </Text>
  )
}

function Booking() {
  const form = kit.useAppForm(bookingOptions)
  return (
    <Form form={form} aria-label="Book a workshop">
      <Stack gap={5}>
        <Panel title="Attendee">
          <WorkbenchAttendeeFields />
        </Panel>
        <Panel title="Session">
          <WorkbenchSessionFields />
          <WorkbenchSummary />
        </Panel>
        <Footer />
      </Stack>
    </Form>
  )
}

/** Fields, a value summary and the form status, each two levels below the form, with no `form` prop. */
export const Playground: Story = {
  render: () => <Booking />,
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.getByTestId('summary')).toHaveTextContent('1 seat, morning session')
    await expect(canvas.queryByText('Not booked yet')).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('radio', { name: 'Afternoon' }))
    await userEvent.clear(canvas.getByLabelText('Seats'))
    await userEvent.type(canvas.getByLabelText('Seats'), '3')
    await expect(canvas.getByTestId('summary')).toHaveTextContent('3 seats, afternoon session')
    await expect(canvas.getByText('Not booked yet')).toBeInTheDocument()
  },
}

// Shared by the form and every component that reads it from context.
const bookingOptions = formOptions({
  defaultValues: {
    attendee: { name: '', email: '' },
    session: 'morning',
    seats: 1,
  },
})

// Layout components pass children through and never see the form.
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FormSection title={title}>
      <Stack gap={4}>{children}</Stack>
    </FormSection>
  )
}

// Two levels below the form, with no `form` prop: the options give it the form's type.
function AttendeeFields() {
  const form = useTypedAppFormContext(bookingOptions)
  return (
    <>
      <form.TextField name="attendee.name" label="Full name" autoComplete="name" />
      <form.TextField name="attendee.email" label="Email" type="email" autoComplete="email" />
    </>
  )
}

function SessionFields() {
  const form = useTypedAppFormContext(bookingOptions)
  return (
    <>
      <form.SegmentedField
        name="session"
        label="Session"
        options={[
          { value: 'morning', label: 'Morning' },
          { value: 'afternoon', label: 'Afternoon' },
        ]}
      />
      <form.NumberField name="seats" label="Seats" min={1} max={6} />
    </>
  )
}

// Subscribes to two values, so only this line re-renders as they change.
function Summary() {
  const form = useTypedAppFormContext(bookingOptions)
  const seats = useFieldValue(form, 'seats')
  const session = useFieldValue(form, 'session')
  return (
    <Text aria-live="polite">
      {seats} {seats === 1 ? 'seat' : 'seats'}, {session} session
    </Text>
  )
}

// Form-wide hooks find the form in context by themselves.
function Footer() {
  const { isDirty } = useFormStatus()
  return (
    <Inline gap={4} align="center">
      <SubmitButton>Book</SubmitButton>
      {isDirty ? <Text tone="muted">Not booked yet</Text> : null}
    </Inline>
  )
}

/**
 * Nothing between the form and its fields passes `form` down. `AttendeeFields` and `SessionFields`
 * render bound fields, `Summary` reads two values, and `Footer` reads the form's status.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [booked, setBooked] = useState<string | null>(null)
    const form = useAppForm({
      ...bookingOptions,
      onSubmit: async ({ value }) => {
        await new Promise((resolve) => setTimeout(resolve, 600))
        setBooked(value.attendee.email)
      },
    })
    return (
      <Form form={form} aria-label="Book a workshop">
        <Stack gap={5}>
          <Panel title="Attendee">
            <AttendeeFields />
          </Panel>
          <Panel title="Session">
            <SessionFields />
            <Summary />
          </Panel>
          <Footer />
          {booked ? (
            <Alert tone="positive" title="Booked">
              Your confirmation is on its way to {booked}.
            </Alert>
          ) : null}
        </Stack>
      </Form>
    )
  },
}
