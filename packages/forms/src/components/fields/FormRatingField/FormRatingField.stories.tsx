import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormRatingField } from './FormRatingField'

const meta = {
  title: 'Forms/Fields/RatingField',
  component: FormRatingField,
  args: { label: 'Rate this session' },
} satisfies Meta<typeof FormRatingField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: null as number | null }} label="Rate the talk">
      {(form) => (
        <form.RatingField
          name="value"
          label="Rate this session"
          description="Designing for slow networks, Thursday 10:00"
          clearable
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
            <FieldDemo defaultValues={{ value: null as number | null }}>
              {(form) => <form.RatingField name="value" label="Rate this session" clearable />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: null as number | null }}>
              {(form) => (
                <form.RatingField
                  name="value"
                  label="Rate this session"
                  description="Designing for slow networks, Thursday 10:00"
                  clearable
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: null as number | null }} reveal>
              {(form) => (
                <form.RatingField
                  name="value"
                  label="Rate this session"
                  required
                  validators={{
                    onDynamic: () => 'Rate the session to see everyone else’s ratings',
                  }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 5 }} reveal>
              {(form) => (
                <form.RatingField
                  name="value"
                  label="Rate this session"
                  warn={() => 'You already rated this one 2 stars'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 4 }}>
              {(form) => <form.RatingField name="value" label="Rate this session" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 4 }}>
              {(form) => <form.RatingField name="value" label="Rate this session" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 4 }} reveal>
              {(form) => (
                <form.RatingField
                  name="value"
                  label="Rate this session"
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
      defaultValues={{ rating: null as number | null, comment: '' }}
      label="Rate the talk"
      submitLabel="Submit rating"
    >
      {(form) => (
        <>
          <form.RatingField
            name="rating"
            label="Rate this session"
            description="Designing for slow networks, Thursday 10:00"
            required
            clearable
          />
          <form.TextareaField name="comment" label="Comment" rows={3} />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 4 }} mode="view" label="Rate this session">
      {(form) => <form.RatingField name="value" label="Rate this session" />}
    </FieldDemo>
  ),
}

/**
 * A clearable rating bound to `rating`, with the value it holds underneath: `null` until a star is
 * chosen.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { rating: null as number | null } })
    const value = useFieldValue(form, 'rating')
    return (
      <Form form={form} aria-label="RatingField example">
        <Stack gap={4}>
          <form.RatingField name="rating" label="How was your crossing?" clearable />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
