import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, useState } from 'react'
import { Button, Code, Grid, Heading, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { Form } from '#components'
import { kit } from '#kit'
import { FormGrid, FormStep, FormSteps, When } from '#layouts'
import { recipeParameters } from '#stories/recipes/parameters'
import { RecipeFrame, SubmittedOutput } from '#stories/recipes/RecipeFrame'

/*
 * Recipe: Onboarding — a new client signing on with a small design agency. The "Company" step
 * only exists when a company is paying. The step lives in the URL (controlled `value`), so a
 * reminder email can link straight to billing. Choose "Me, personally" after filling in company
 * details and the company branch is pruned from the submitted output.
 */

interface Onboarding {
  name: string
  email: string
  payer: string | number | null
  company: { legalName: string; companyNumber: string; vatNumber: string; poNumber: string }
  billing: { invoiceEmail: string; country: string | null; currency: string | number | null }
  kickoff: { start: string; days: (string | number)[]; notes: string }
}

const STEP_PATHS: Record<string, string> = {
  you: 'you',
  company: 'company',
  billing: 'billing',
  kickoff: 'kick-off',
}

const empty: Onboarding = {
  name: '',
  email: '',
  payer: null,
  company: { legalName: '', companyNumber: '', vatNumber: '', poNumber: '' },
  billing: { invoiceEmail: '', country: 'GB', currency: 'GBP' },
  kickoff: { start: '', days: ['tue', 'thu'], notes: '' },
}

const notBlank = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() === '' ? message : undefined),
})

function OnboardingScreen({
  initial = empty,
  draft,
  startAt = 'you',
}: {
  initial?: Onboarding
  /** Company details restored from an earlier visit (typed input, not defaults). */
  draft?: Onboarding['company']
  startAt?: string
}) {
  const [step, setStep] = useState(startAt)
  const [result, setResult] = useState<{ typed: Onboarding; output: Onboarding } | null>(null)
  const form = kit.useAppForm<Onboarding>({
    defaultValues: initial,
    // `value` and `output` are both pruned (hidden branches fall back to their defaults); the live
    // store still holds what was typed, which is what the left panel shows.
    onSubmit: ({ output, formApi }) => {
      setResult({ typed: structuredClone(formApi.state.values as Onboarding), output })
    },
  })
  const restored = useRef(false)
  useEffect(() => {
    if (restored.current || !draft) return
    restored.current = true
    form.setFieldValue('company', draft)
  }, [form, draft])

  if (result) {
    return (
      <Stack gap={7}>
        <Stack gap={3}>
          <Heading level={1} size="display-sm">
            Welcome aboard
          </Heading>
          <Text measure="text">
            The kick-off invite is on its way to {result.output.email}. Compare the two panels:
            anything typed on a branch you didn&apos;t take stays in the form but goes back to its
            default in what was submitted.
          </Text>
          <Inline gap={3} justify="start">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null)
              }}
            >
              Back to the form
            </Button>
          </Inline>
        </Stack>
        <Grid columns={{ base: 1, lg: 2 }} gap={6}>
          <SubmittedOutput title="What was typed" value={result.typed} />
          <SubmittedOutput title="Submitted output (hidden branch pruned)" value={result.output} />
        </Grid>
      </Stack>
    )
  }

  return (
    <Stack gap={7}>
      <Stack gap={3}>
        <Text size="sm" tone="muted">
          <Code>fernhill.example/start/{STEP_PATHS[step] ?? step}</Code>
        </Text>
        <Heading level={1} size="display-sm">
          Before we start
        </Heading>
        <Text measure="text">
          Four short steps so the first invoice, the first meeting and the first commit all land in
          the right place.
        </Text>
      </Stack>

      <Form form={form} aria-label="Client onboarding">
        <FormSteps
          label="Onboarding"
          value={step}
          onValueChange={setStep}
          headingLevel={2}
          submitLabel="Book the kick-off"
        >
          <FormStep value="you" title="You" description="Who we'll be working with day to day.">
            <FormGrid columns={{ base: 1, md: 2 }}>
              <form.TextField
                name="name"
                label="Full name"
                autoComplete="name"
                required
                validators={notBlank('Enter your name')}
              />
              <form.TextField
                name="email"
                label="Work email"
                type="email"
                autoComplete="email"
                required
                validators={notBlank('Enter your work email')}
              />
            </FormGrid>
            <form.ChoiceCardsField
              name="payer"
              label="Who's paying the invoices?"
              columns={{ base: 1, md: 2 }}
              options={[
                {
                  value: 'personal',
                  label: 'Me, personally',
                  description: 'Invoices in your name. No VAT number needed.',
                },
                {
                  value: 'company',
                  label: 'A company',
                  description: 'Invoices to the business, with a PO if you use them.',
                },
              ]}
              required
              validators={{
                onDynamic: ({ value }) => (value === null ? 'Choose who pays' : undefined),
              }}
            />
          </FormStep>

          <When form={form} is={(values) => values.payer === 'company'} names={['company']}>
            <FormStep
              value="company"
              title="Company"
              description="Exactly as it appears on Companies House."
            >
              <form.TextField
                name="company.legalName"
                label="Registered name"
                autoComplete="organization"
                required
                validators={notBlank('Enter the registered company name')}
              />
              <FormGrid columns={{ base: 1, md: 2 }}>
                <form.TextField
                  name="company.companyNumber"
                  label="Company number"
                  description="Eight characters, e.g. 09876543."
                  required
                  validators={{
                    onDynamic: ({ value }) =>
                      /^[A-Z0-9]{8}$/i.test(value.trim())
                        ? undefined
                        : 'Company numbers are eight characters',
                  }}
                />
                <form.TextField name="company.vatNumber" label="VAT number" optional />
              </FormGrid>
              <form.TextField
                name="company.poNumber"
                label="Purchase order"
                optional
                description="If accounts won't pay without one, add it now and it goes on every invoice."
              />
            </FormStep>
          </When>

          <FormStep
            value="billing"
            title="Billing"
            description="Invoices go out on the last working day of the month."
          >
            <FormGrid columns={{ base: 1, md: 2 }}>
              <form.TextField
                name="billing.invoiceEmail"
                label="Send invoices to"
                type="email"
                required
                validators={notBlank('Enter an email for invoices')}
              />
              <form.SelectField
                name="billing.country"
                label="Billing country"
                options={[
                  { value: 'GB', label: 'United Kingdom' },
                  { value: 'IE', label: 'Ireland' },
                  { value: 'AU', label: 'Australia' },
                  { value: 'NZ', label: 'New Zealand' },
                  { value: 'US', label: 'United States' },
                ]}
              />
            </FormGrid>
            <form.SegmentedField
              name="billing.currency"
              label="Invoice currency"
              options={[
                { value: 'GBP', label: 'Pounds' },
                { value: 'EUR', label: 'Euros' },
                { value: 'AUD', label: 'Australian dollars' },
              ]}
            />
          </FormStep>

          <FormStep
            value="kickoff"
            title="Kick-off"
            description="Ninety minutes on a call, then we start shipping."
          >
            <form.DateField
              name="kickoff.start"
              label="Earliest start"
              min="2026-11-02"
              required
              validators={notBlank('Pick a start date')}
            />
            <form.ChipsField
              name="kickoff.days"
              label="Good days for a weekly check-in"
              options={[
                { value: 'mon', label: 'Monday' },
                { value: 'tue', label: 'Tuesday' },
                { value: 'wed', label: 'Wednesday' },
                { value: 'thu', label: 'Thursday' },
                { value: 'fri', label: 'Friday' },
              ]}
            />
            <form.TextareaField
              name="kickoff.notes"
              label="Anything we should read first?"
              optional
              rows={3}
              description="A brief, a repo, last quarter's retro."
            />
          </FormStep>
        </FormSteps>
      </Form>
    </Stack>
  )
}

const meta = {
  title: 'Forms/Getting started/Onboarding',
  parameters: recipeParameters,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Blank: Story = {
  render: () => (
    <RecipeFrame theme="monograph">
      <OnboardingScreen />
    </RecipeFrame>
  ),
}

/**
 * Opened from the reminder email's "Finish billing" link. Company details were typed on an earlier
 * visit, then the payer switched to "Me, personally": submit from the last step and the `company`
 * branch goes out as its empty defaults, not as what was typed.
 */
export const DeepLinkedToBilling: Story = {
  name: 'Deep-linked to billing',
  render: () => (
    <RecipeFrame theme="monograph">
      <OnboardingScreen
        startAt="billing"
        draft={{
          legalName: 'Marsh & Co Ltd',
          companyNumber: '09876543',
          vatNumber: 'GB123456789',
          poNumber: 'PO-2211',
        }}
        initial={{
          ...empty,
          name: 'Ellie Marsh',
          email: 'ellie@marshandco.example',
          payer: 'personal',
          billing: { invoiceEmail: 'ellie@marshandco.example', country: 'GB', currency: 'GBP' },
          kickoff: { start: '2026-11-09', days: ['tue', 'thu'], notes: '' },
        }}
      />
    </RecipeFrame>
  ),
}
