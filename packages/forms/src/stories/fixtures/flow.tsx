/** Parity fixtures: sentence, review, `when` and the content nodes (§9.10, §9.11, §6.6, §10.1). */
import { Alert, Divider, Heading, Stack, Text } from '@mitcsutt/kiln-ui'
import { ErrorSummary } from '#components/form/ErrorSummary'
import { FormStatus } from '#components/form/FormStatus'
import { SubmitButton } from '#components/form/SubmitButton'
import { kit } from '#kit/defaultKit'
import { FormReview, FormSentence, When } from '#components/layouts'
import { defineParity } from '#stories/fixtures/parity'

// --- sentence --------------------------------------------------------------------------------
interface RecurringInvoice {
  client: string
  amount: number | null
  start: string
}

export const sentenceSchema = kit.defineFormSchema<RecurringInvoice>()({
  version: 1,
  root: {
    layout: 'sentence',
    label: 'Recurring invoice',
    children: [
      { content: 'text', text: 'Bill ' },
      { kind: 'text', name: 'client', label: 'Client', htmlSize: 14 },
      { content: 'text', text: ' ' },
      { kind: 'amount', name: 'amount', label: 'Amount', currency: 'GBP' },
      { content: 'text', text: ' every month starting ' },
      { kind: 'date', name: 'start', label: 'Start date' },
      { content: 'text', text: '.' },
    ],
  },
})

export const sentenceFixture = defineParity({
  name: 'Recurring invoice',
  covers: ['sentence', 'text'],
  defaultValues: { client: '', amount: null, start: '' } satisfies RecurringInvoice,
  schema: sentenceSchema,
  render: (form) => (
    <FormSentence label="Recurring invoice">
      Bill <form.TextField name="client" label="Client" htmlSize={14} />{' '}
      <form.AmountField name="amount" label="Amount" currency="GBP" /> every month starting{' '}
      <form.DateField name="start" label="Start date" />.
    </FormSentence>
  ),
})

// --- review ----------------------------------------------------------------------------------
interface Booking {
  name: string
  email: string
  session: 'morning' | 'afternoon'
}

const sessions = [
  { value: 'morning', label: 'Morning, 9:30 to 12:30' },
  { value: 'afternoon', label: 'Afternoon, 1:30 to 4:30' },
] as const

export const reviewSchema = kit.defineFormSchema<Booking>()({
  version: 1,
  root: {
    layout: 'review',
    title: 'Check your booking',
    children: [
      { kind: 'text', name: 'name', label: 'Full name' },
      { kind: 'text', name: 'email', label: 'Email' },
      { kind: 'radio', name: 'session', label: 'Session', options: [...sessions] },
    ],
  },
})

export const reviewFixture = defineParity({
  name: 'Check your booking',
  covers: ['review'],
  defaultValues: { name: 'Priya Shah', email: '', session: 'afternoon' },
  schema: reviewSchema,
  render: (form) => (
    <FormReview title="Check your booking">
      <form.TextField name="name" label="Full name" />
      <form.TextField name="email" label="Email" />
      <form.RadioField name="session" label="Session" options={[...sessions]} />
    </FormReview>
  ),
})

// --- when ------------------------------------------------------------------------------------
interface Collection {
  method: 'delivery' | 'pickup'
  address: string
  pickupTime: string
}

const methods = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Collect from the shop' },
] as const

export const whenSchema = kit.defineFormSchema<Collection>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      {
        kind: 'radio',
        name: 'method',
        label: 'How do you want your order?',
        options: [...methods],
      },
      {
        kind: 'textarea',
        name: 'address',
        label: 'Delivery address',
        when: { field: 'method', op: 'eq', value: 'delivery' },
        rules: [{ rule: 'required', message: 'Enter a delivery address' }],
      },
      {
        kind: 'time',
        name: 'pickupTime',
        label: 'Collection time',
        when: { field: 'method', op: 'eq', value: 'pickup' },
      },
    ],
  },
})

export const whenFixture = defineParity({
  name: 'Order collection',
  covers: ['when'],
  defaultValues: { method: 'delivery', address: '', pickupTime: '' },
  schema: whenSchema,
  render: (form) => (
    <Stack gap={5}>
      <form.RadioField name="method" label="How do you want your order?" options={[...methods]} />
      <When form={form} is={(values) => values.method === 'delivery'}>
        <form.TextareaField
          name="address"
          label="Delivery address"
          validators={{
            onDynamic: ({ value }) =>
              value.trim() === '' ? 'Enter a delivery address' : undefined,
          }}
        />
      </When>
      <When form={form} is={(values) => values.method === 'pickup'}>
        <form.TimeField name="pickupTime" label="Collection time" />
      </When>
    </Stack>
  ),
})

// --- content ---------------------------------------------------------------------------------
interface Feedback {
  rating: number | null
  comments: string
}

export const contentSchema = kit.defineFormSchema<Feedback>()({
  version: 1,
  root: {
    layout: 'stack',
    gap: 5,
    children: [
      { content: 'heading', text: 'Rate the workshop', level: 2 },
      { content: 'text', text: 'Your answers help us plan the next one.' },
      { content: 'errorSummary' },
      {
        content: 'alert',
        tone: 'info',
        title: 'Anonymous',
        text: 'We never show your name next to your feedback.',
      },
      { kind: 'rating', name: 'rating', label: 'Overall rating' },
      { content: 'divider' },
      { kind: 'textarea', name: 'comments', label: 'Anything else?' },
      { content: 'status' },
      { content: 'submit', label: 'Send feedback' },
    ],
  },
})

export const contentFixture = defineParity({
  name: 'Workshop feedback',
  covers: ['heading', 'text', 'errorSummary', 'alert', 'divider', 'status', 'submit'],
  defaultValues: { rating: null, comments: '' } satisfies Feedback,
  schema: contentSchema,
  render: (form) => (
    <Stack gap={5}>
      <Heading level={2}>Rate the workshop</Heading>
      <Text>Your answers help us plan the next one.</Text>
      <ErrorSummary />
      <Alert tone="info" title="Anonymous">
        We never show your name next to your feedback.
      </Alert>
      <form.RatingField name="rating" label="Overall rating" />
      <Divider />
      <form.TextareaField name="comments" label="Anything else?" />
      <FormStatus />
      <SubmitButton>Send feedback</SubmitButton>
    </Stack>
  ),
})
