import type { ReactNode } from 'react'
import { Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { Form, SubmitButton } from '#components/form'
import { useFieldValue, useFormStatus } from '#hooks'
import { formOptions } from '#kit/formOptions'
import { kit } from '#kit/defaultKit'
import { FormSection } from '#components/layouts'

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

const bookingOptions = formOptions({
  defaultValues: {
    attendee: { name: '', email: '' },
    session: 'morning',
    seats: 1,
  },
})

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FormSection title={title}>
      <Stack gap={4}>{children}</Stack>
    </FormSection>
  )
}

function AttendeeFields() {
  const form = kit.useTypedAppFormContext(bookingOptions)
  return (
    <>
      <form.TextField name="attendee.name" label="Full name" autoComplete="name" />
      <form.TextField name="attendee.email" label="Email" type="email" autoComplete="email" />
    </>
  )
}

function SessionFields() {
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

function Summary() {
  const form = kit.useTypedAppFormContext(bookingOptions)
  const seats = useFieldValue(form, 'seats')
  const session = useFieldValue(form, 'session')
  return (
    <Text aria-live="polite" data-testid="summary">
      {seats} {seats === 1 ? 'seat' : 'seats'}, {session} session
    </Text>
  )
}

function Footer() {
  const { isDirty } = useFormStatus()
  return (
    <Inline gap={4} align="center">
      <SubmitButton>Book</SubmitButton>
      {isDirty ? <Text tone="muted">Not booked yet</Text> : null}
    </Inline>
  )
}

function Booking() {
  const form = kit.useAppForm(bookingOptions)
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
