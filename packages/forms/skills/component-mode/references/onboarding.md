<!-- Generated from the Kiln docs by apps/docs/src/skills. Edit the docs pages, then run `pnpm generate:skills`. -->

# Onboarding

> A multi-step application with a branch that only some people see, and a review step built from the same fields.

Source: https://kiln.mitchellsutton.com/docs/forms/getting-started/onboarding

Four steps, one of them conditional: the "Proof" step only exists for people claiming a concession. Choose a concession, fill in the card number, then go back and choose "No": the proof step disappears, and its values are reset to their defaults in what's submitted.

```tsx
import {
  Form,
  FormGrid,
  FormReview,
  FormStep,
  FormSteps,
  useAppForm,
  When,
} from '@mitcsutt/kiln-forms'
import { Alert, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

interface Application {
  name: string
  email: string
  concession: string | null
  proof: { reference: string; expires: string }
  pass: string | null
}

const required = (message: string) => ({
  onDynamic: ({ value }: { value: string }) => (value.trim() === '' ? message : undefined),
})

export default function Onboarding() {
  const [submitted, setSubmitted] = useState<Application | null>(null)
  const form = useAppForm<Application>({
    defaultValues: {
      name: '',
      email: '',
      concession: null,
      proof: { reference: '', expires: '' },
      pass: 'month',
    },
    // `value` arrives pruned: proof details typed and then hidden go back to their defaults.
    onSubmit: ({ value }) => {
      setSubmitted(value)
    },
  })
  if (submitted) {
    return (
      <Alert tone="positive" title="Application sent">
        We&apos;ll email {submitted.email} when your pass is ready.
      </Alert>
    )
  }
  return (
    <Form form={form} aria-label="Apply for a travel pass">
      <FormSteps label="Application" headingLevel={3} submitLabel="Send application">
        <FormStep value="you" title="You" description="Who the pass is for.">
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
          </FormGrid>
          <form.RadioField
            name="concession"
            label="Do you qualify for a concession?"
            options={[
              { value: 'none', label: 'No' },
              { value: 'student', label: 'Yes, I’m a student' },
              { value: 'senior', label: 'Yes, I’m over 66' },
            ]}
            validators={{ onDynamic: ({ value }) => (value === null ? 'Choose one' : undefined) }}
          />
        </FormStep>
        <When
          form={form}
          is={(values) => values.concession === 'student' || values.concession === 'senior'}
          names={['proof']}
        >
          <FormStep value="proof" title="Proof" description="Only for concessions.">
            <form.TextField
              name="proof.reference"
              label="Card number"
              required
              validators={required('Enter the card number')}
            />
            <form.DateField name="proof.expires" label="Expires" />
          </FormStep>
        </When>
        <FormStep value="pass" title="Pass">
          <form.ChoiceCardsField
            name="pass"
            label="Pass length"
            columns={{ base: 1, sm: 2 }}
            options={[
              { value: 'month', label: 'Month', description: 'Renews automatically' },
              { value: 'year', label: 'Year', description: 'Two months free' },
            ]}
          />
        </FormStep>
        <FormStep value="review" title="Check your answers">
          <Text tone="muted">Nothing is sent until you press the button below.</Text>
          <FormReview title="Your application">
            <form.TextField name="name" label="Full name" />
            <form.TextField name="email" label="Email" />
            <form.RadioField
              name="concession"
              label="Concession"
              options={[
                { value: 'none', label: 'None' },
                { value: 'student', label: 'Student' },
                { value: 'senior', label: 'Over 66' },
              ]}
            />
            <form.ChoiceCardsField
              name="pass"
              label="Pass"
              options={[
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
            />
          </FormReview>
        </FormStep>
      </FormSteps>
    </Form>
  )
}
```

## How it's built

- **`FormSteps`** shows a `Stepper`, renders Back and Next, validates each step before moving on, and moves focus to the new step's heading. On the last step, Next submits.
- **`When`** around a step removes it from the sequence while it's hidden. `names={['proof']}` tells it which values to reset when hidden, even before the step has been shown.
- **`FormReview`** renders the same fields again in view mode, as a list of answers to check.
- **Pruning.** `onSubmit` receives values with hidden branches back at their defaults, so a concession card number typed and then abandoned is never sent.
