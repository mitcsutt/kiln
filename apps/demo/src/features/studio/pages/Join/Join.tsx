import {
  ErrorSummary,
  Form,
  FormGrid,
  FormGridItem,
  FormReview,
  FormStep,
  FormSteps,
  useAppForm,
  useFieldValue,
  useFormSteps,
  When,
} from '@mitcsutt/kiln-forms'
import { Alert, Button, Page, Prose, Stack, Text, type FileValue } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import { PageHeader } from '#components/PageHeader'
import { delay } from '#utils/delay'

type Plan = 'drop-in' | 'shelf' | 'studio'
type Interest = 'wheel' | 'hand' | 'glaze' | 'raku'

interface Application {
  name: string
  email: string
  phone: string
  code: string
  birthday: string
  experience: 'new' | 'some' | 'years' | null
  portfolio: readonly FileValue[]
  interests: Interest[]
  plan: Plan | null
  extras: ('locker' | 'storage' | 'parking')[]
  tools: readonly string[]
  notes: string
  agreed: boolean
}

const EMPTY: Application = {
  name: '',
  email: '',
  phone: '',
  code: '',
  birthday: '',
  experience: null,
  portfolio: [],
  interests: [],
  plan: null,
  extras: [],
  tools: [],
  notes: '',
  agreed: false,
}

const PLANS = [
  {
    value: 'drop-in' as const,
    label: 'Drop-in',
    description: 'Pay per session',
    meta: '£15 a visit',
  },
  {
    value: 'shelf' as const,
    label: 'Shelf',
    description: 'A shelf and two evenings a week',
    meta: '£65 a month',
  },
  {
    value: 'studio' as const,
    label: 'Studio',
    description: 'Any time, with a key fob',
    meta: '£120 a month',
  },
]

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() === '' ? message : undefined),
})

/** A count of the steps, read from inside the form with `useFormSteps`. */
function StepCount() {
  const steps = useFormSteps()
  return (
    <Text size="sm" tone="muted">
      Step {steps.index + 1} of {steps.count}
    </Text>
  )
}

/** The membership application: four steps, a branch only experienced potters see, and a review. */
export function Join() {
  const [sent, setSent] = useState<string | null>(null)
  const form = useAppForm<Application>({
    defaultValues: EMPTY,
    onSubmit: async ({ value }) => {
      await delay(null, 900)
      setSent(value.email)
    },
  })
  const plan = useFieldValue(form, 'plan')
  if (sent) {
    return (
      <Page>
        <PageHeader
          kicker="Studio admin"
          title="Membership application"
          description="Applications are read by the committee every Sunday."
          theme="paper"
        />
        <Alert
          tone="positive"
          title="Application sent"
          action={
            <Button
              size="sm"
              variant="outline"
              tone="neutral"
              onClick={() => {
                form.reset()
                setSent(null)
              }}
            >
              Start another
            </Button>
          }
        >
          We&apos;ll write to {sent} within a week.
        </Alert>
      </Page>
    )
  }
  return (
    <Page>
      <PageHeader
        kicker="Studio admin"
        title="Membership application"
        description="What a new member fills in. The portfolio step only appears for people who've thrown before."
        theme="paper"
      />
      <Form form={form} aria-label="Apply for membership">
        <Stack gap={5}>
          <ErrorSummary />
          <FormSteps label="Application" headingLevel={2} submitLabel="Send application">
            <FormStep value="you" title="You" description="How we reach you.">
              <StepCount />
              <FormGrid columns={{ base: 1, md: 2 }}>
                <form.TextField
                  name="name"
                  label="Full name"
                  autoComplete="name"
                  required
                  validators={required('Enter your name')}
                />
                <form.TextField
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  validators={required('Enter your email')}
                />
                <form.TextField
                  name="phone"
                  label="Mobile"
                  type="tel"
                  autoComplete="tel"
                  optional
                />
                <form.OneTimeCodeField
                  name="code"
                  label="Code from the text"
                  description="Type 123456: the demo sends nothing."
                  length={6}
                  optional
                />
                <FormGridItem span={{ base: 1, md: 2 }}>
                  <form.DateField
                    name="birthday"
                    label="Date of birth"
                    description="Members are 16 or over."
                    optional
                  />
                </FormGridItem>
              </FormGrid>
              <form.RadioField
                name="experience"
                label="How much clay have you thrown?"
                options={[
                  { value: 'new', label: 'None yet' },
                  { value: 'some', label: 'A course or two' },
                  { value: 'years', label: 'Years of it' },
                ]}
                validators={{
                  onDynamic: ({ value }) => (value === null ? 'Choose one' : undefined),
                }}
              />
            </FormStep>
            <When form={form} is={(values) => values.experience === 'years'} names={['portfolio']}>
              <FormStep value="work" title="Your work" description="Only for experienced potters.">
                <form.FileField
                  name="portfolio"
                  label="Photos of your work"
                  description="Up to three images, 5 MB each."
                  accept="image/*"
                  multiple
                  maxFiles={3}
                  maxSize={5_000_000}
                  preview="thumbnails"
                />
                <form.TagsField
                  name="tools"
                  label="Tools you'll bring"
                  placeholder="Add a tool"
                  optional
                />
              </FormStep>
            </When>
            <FormStep value="plan" title="Plan">
              <form.ChoiceCardsField
                name="plan"
                label="Membership"
                columns={{ base: 1, md: 3 }}
                options={PLANS}
                validators={{
                  onDynamic: ({ value }) => (value === null ? 'Choose a plan' : undefined),
                }}
              />
              <form.MultiChoiceCardsField
                name="interests"
                label="What do you want to make?"
                columns={{ base: 1, sm: 2 }}
                options={[
                  { value: 'wheel', label: 'Wheel-thrown pots' },
                  { value: 'hand', label: 'Hand-built pieces' },
                  { value: 'glaze', label: 'Glaze tests' },
                  { value: 'raku', label: 'Raku firings' },
                ]}
              />
              {plan === 'drop-in' ? null : (
                <form.CheckboxGroupField
                  name="extras"
                  label="Extras"
                  options={[
                    { value: 'locker', label: 'A locker (£5 a month)' },
                    { value: 'storage', label: 'Damp-box storage' },
                    { value: 'parking', label: 'A parking permit' },
                  ]}
                />
              )}
              <form.TextareaField name="notes" label="Anything we should know?" optional />
            </FormStep>
            <FormStep value="review" title="Check your answers">
              <FormReview title="Your application">
                <form.TextField name="name" label="Full name" />
                <form.TextField name="email" label="Email" />
                <form.RadioField
                  name="experience"
                  label="Experience"
                  options={[
                    { value: 'new', label: 'None yet' },
                    { value: 'some', label: 'A course or two' },
                    { value: 'years', label: 'Years of it' },
                  ]}
                />
                <form.ChoiceCardsField name="plan" label="Plan" options={PLANS} />
              </FormReview>
              <Prose size="sm">
                <p>
                  Members keep the studio as they found it: wedge your own clay, wipe the wheel, and
                  never open a kiln above 100°C. The full <strong>studio rules</strong> come with
                  your welcome email.
                </p>
              </Prose>
              <form.CheckboxField
                name="agreed"
                label="I'll follow the studio rules"
                validators={{
                  onDynamic: ({ value }) =>
                    value ? undefined : 'Tick this to send your application',
                }}
              />
            </FormStep>
          </FormSteps>
        </Stack>
      </Form>
    </Page>
  )
}
