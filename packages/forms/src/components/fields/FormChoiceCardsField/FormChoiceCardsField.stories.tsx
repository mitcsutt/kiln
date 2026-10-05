import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text, Amount } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormChoiceCardsField } from './FormChoiceCardsField'

const tickets = [
  { value: 'day', label: 'One day', description: 'Thursday talks only' },
  { value: 'both', label: 'Both days', description: 'Talks and the Friday workshops' },
  { value: 'supporter', label: 'Supporter', description: 'Both days, plus a place for a student' },
]

const ticketPrices: Record<string, number> = { day: 120, both: 220, supporter: 340 }

const meta = {
  title: 'Forms/Fields/ChoiceCardsField',
  component: FormChoiceCardsField,
  args: { label: 'Ticket' },
} satisfies Meta<typeof FormChoiceCardsField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: null as string | number | null }} label="Event registration">
      {(form) => (
        <form.ChoiceCardsField
          name="value"
          label="Ticket"
          description="Prices include VAT"
          options={tickets}
          columns={{ base: 1, sm: 3 }}
          optionMeta={(value) => (
            <Amount value={ticketPrices[String(value)] ?? 0} currency="GBP" precision={0} />
          )}
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
            <FieldDemo defaultValues={{ value: null as string | number | null }}>
              {(form) => (
                <form.ChoiceCardsField
                  name="value"
                  label="Ticket"
                  options={tickets}
                  columns={{ base: 1, sm: 3 }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | null }}>
              {(form) => (
                <form.ChoiceCardsField
                  name="value"
                  label="Ticket"
                  description="Prices include VAT"
                  options={tickets}
                  columns={{ base: 1, sm: 3 }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | null }} reveal>
              {(form) => (
                <form.ChoiceCardsField
                  name="value"
                  label="Ticket"
                  options={tickets}
                  columns={{ base: 1, sm: 3 }}
                  required
                  validators={{ onDynamic: () => 'Choose a ticket to register' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 'supporter' }} reveal>
              {(form) => (
                <form.ChoiceCardsField
                  name="value"
                  label="Ticket"
                  options={tickets}
                  columns={{ base: 1, sm: 3 }}
                  warn={() => 'Supporter tickets are non-refundable'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 'both' }}>
              {(form) => (
                <form.ChoiceCardsField
                  name="value"
                  label="Ticket"
                  options={tickets}
                  columns={{ base: 1, sm: 3 }}
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 'both' }}>
              {(form) => (
                <form.ChoiceCardsField
                  name="value"
                  label="Ticket"
                  options={tickets}
                  columns={{ base: 1, sm: 3 }}
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 'both' }} reveal>
              {(form) => (
                <form.ChoiceCardsField
                  name="value"
                  label="Ticket"
                  options={tickets}
                  columns={{ base: 1, sm: 3 }}
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
      defaultValues={{ name: '', ticket: null as string | number | null }}
      label="Event registration"
      submitLabel="Register"
    >
      {(form) => (
        <>
          <form.TextField name="name" label="Your name" required />
          <form.ChoiceCardsField
            name="ticket"
            label="Ticket"
            description="Prices include VAT"
            options={tickets}
            columns={{ base: 1, sm: 3 }}
            required
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 'both' }} mode="view" label="Ticket">
      {(form) => <form.ChoiceCardsField name="value" label="Ticket" options={tickets} />}
    </FieldDemo>
  ),
}

/**
 * `optionMeta` adds a figure to each card (usually the price), computed from the option's value.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { plan: null as string | null } })
    const value = useFieldValue(form, 'plan')
    return (
      <Form form={form} aria-label="ChoiceCardsField example">
        <Stack gap={4}>
          <form.ChoiceCardsField
            name="plan"
            label="Pass"
            columns={{ base: 1, sm: 2 }}
            options={[
              { value: 'month', label: 'Month', description: 'Renews automatically' },
              { value: 'year', label: 'Year', description: 'Two months free' },
            ]}
            optionMeta={(value) => (value === 'month' ? '£82' : '£790')}
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
