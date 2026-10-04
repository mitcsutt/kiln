import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Amount, Button, Heading, Inline, Stack, Stat, Text } from '@mitcsutt/kiln-ui'
import { Form, SubmitButton } from '#components'
import { useFieldValue } from '#core/hooks'
import type { KitForm } from '#core/kit/types'
import { kit } from '#kit'
import { FormActions, FormSentence } from '#layouts'
import { recipeParameters } from '#stories/recipes/parameters'
import { RecipeFrame, SubmittedOutput } from '#stories/recipes/RecipeFrame'

/*
 * Recipe: Savings goal — a goal written as one sentence (FormSentence). The answer to "how much
 * do I put away?" is computed from the sentence as it's typed and sits beside it; that number is
 * the reason the form exists, so it gets the display type.
 */

interface Goal {
  target: number | null
  goal: string
  deadline: string
  cadence: string | number | null
}

type GoalForm = KitForm<Goal, undefined, typeof kit.registries.fields>

const TODAY = new Date('2026-10-04T00:00:00')

const PER_YEAR: Record<string, number> = { week: 52, fortnight: 26, month: 12 }
const CADENCE_LABEL: Record<string, string> = {
  week: 'one a week',
  fortnight: 'one a fortnight',
  month: 'one a month',
}

/** How many deposits fit between today and the deadline at the chosen cadence. */
function deposits(deadline: string, cadence: string | number | null): number {
  if (!deadline || typeof cadence !== 'string') return 0
  const end = new Date(`${deadline}T00:00:00`)
  const years = (end.getTime() - TODAY.getTime()) / (365.25 * 24 * 3600 * 1000)
  return Math.max(0, Math.floor(years * (PER_YEAR[cadence] ?? 0)))
}

function Plan({ form }: { form: GoalForm }) {
  const target = useFieldValue(form, 'target')
  const deadline = useFieldValue(form, 'deadline')
  const cadence = useFieldValue(form, 'cadence')
  const count = deposits(deadline, cadence)
  const each = target !== null && count > 0 ? Math.ceil((target / count) * 100) / 100 : null
  const cadenceLabel = typeof cadence === 'string' ? (CADENCE_LABEL[cadence] ?? '') : ''

  return (
    <Stat
      size="hero"
      label="Put away"
      value={
        each === null ? (
          <Text as="span" tone="muted">
            —
          </Text>
        ) : (
          <Amount value={each} currency="AUD" />
        )
      }
      hint={
        each === null
          ? 'Fill in the sentence and the plan appears here.'
          : `${String(count)} deposits, ${cadenceLabel}, until ${new Date(`${deadline}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}.`
      }
    />
  )
}

function GoalScreen({ initial }: { initial: Goal }) {
  const [saved, setSaved] = useState<Goal | null>(null)
  const form = kit.useAppForm<Goal>({
    defaultValues: initial,
    onSubmit: ({ output }) => {
      setSaved(output)
    },
  })

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading level={1} size="xl">
          New savings goal
        </Heading>
        <Text tone="muted">Rainy-day saver · Balance $6,420.18</Text>
      </Stack>

      <Form form={form} aria-label="New savings goal">
        <Stack gap={8}>
          <FormSentence label="Savings goal">
            I want to save{' '}
            <form.AmountField
              name="target"
              label="Amount"
              currency="AUD"
              validators={{
                onDynamic: ({ value }) =>
                  value === null || value <= 0 ? 'Enter an amount to save' : undefined,
              }}
            />{' '}
            for{' '}
            <form.TextField
              name="goal"
              label="What it's for"
              htmlSize={18}
              placeholder="Japan, April 2027"
              validators={{
                onDynamic: ({ value }) =>
                  value.trim() === '' ? 'Say what the money is for' : undefined,
              }}
            />{' '}
            by{' '}
            <form.DateField
              name="deadline"
              label="Deadline"
              min="2026-10-05"
              validators={{ onDynamic: ({ value }) => (value === '' ? 'Pick a date' : undefined) }}
            />
            , putting money aside every{' '}
            <form.SelectField
              name="cadence"
              label="How often"
              options={[
                { value: 'week', label: 'week' },
                { value: 'fortnight', label: 'fortnight' },
                { value: 'month', label: 'month' },
              ]}
            />
            .
          </FormSentence>
          <Plan form={form} />
          <FormActions align="start">
            <SubmitButton>Start saving</SubmitButton>
          </FormActions>
        </Stack>
      </Form>

      {saved ? (
        <Stack gap={4}>
          <Inline gap={3} justify="start" align="center">
            <Text weight="medium">Goal saved. The first transfer is scheduled for Monday.</Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSaved(null)
              }}
            >
              Hide
            </Button>
          </Inline>
          <SubmittedOutput value={saved} />
        </Stack>
      ) : null}
    </Stack>
  )
}

const meta = {
  title: 'Forms/Getting started/Savings goal',
  parameters: recipeParameters,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Blank: Story = {
  render: () => (
    <RecipeFrame theme="monograph">
      <GoalScreen initial={{ target: null, goal: '', deadline: '', cadence: 'fortnight' }} />
    </RecipeFrame>
  ),
}

/** The Japan trip: $10,000 by the end of March, monthly. */
export const Japan: Story = {
  render: () => (
    <RecipeFrame theme="monograph">
      <GoalScreen
        initial={{
          target: 10000,
          goal: 'Japan, April 2027',
          deadline: '2027-03-31',
          cadence: 'month',
        }}
      />
    </RecipeFrame>
  ),
}
