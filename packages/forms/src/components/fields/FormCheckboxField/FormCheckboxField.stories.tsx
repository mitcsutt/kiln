import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormCheckboxField } from './FormCheckboxField'

const meta = {
  title: 'Forms/Fields/CheckboxField',
  component: FormCheckboxField,
  args: { label: 'Mark as urgent' },
} satisfies Meta<typeof FormCheckboxField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: false }} label="Support request">
      {(form) => (
        <form.CheckboxField
          name="value"
          label="Mark as urgent"
          description="Urgent requests get a reply within four hours"
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
            <FieldDemo defaultValues={{ value: false }}>
              {(form) => <form.CheckboxField name="value" label="Mark as urgent" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: false }}>
              {(form) => (
                <form.CheckboxField
                  name="value"
                  label="Mark as urgent"
                  description="Urgent requests get a reply within four hours"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: false }} reveal>
              {(form) => (
                <form.CheckboxField
                  name="value"
                  label="Accept the community guidelines"
                  required
                  validators={{ onDynamic: () => 'Accept the guidelines to post' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: true }} reveal>
              {(form) => (
                <form.CheckboxField
                  name="value"
                  label="Mark as urgent"
                  warn={() => 'You already have three urgent requests open'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: true }}>
              {(form) => <form.CheckboxField name="value" label="Mark as urgent" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: true }}>
              {(form) => <form.CheckboxField name="value" label="Mark as urgent" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: true }} reveal>
              {(form) => (
                <form.CheckboxField
                  name="value"
                  label="Mark as urgent"
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
    <StoryForm defaultValues={{ subject: '', urgent: false }} label="Support request">
      {(form) => (
        <>
          <form.TextField
            name="subject"
            label="Subject"
            placeholder="Exports stop at 500 rows"
            required
          />
          <form.CheckboxField
            name="urgent"
            label="Mark as urgent"
            description="Urgent requests get a reply within four hours"
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: true }} mode="view" label="Mark as urgent">
      {(form) => <form.CheckboxField name="value" label="Mark as urgent" />}
    </FieldDemo>
  ),
}

/**
 * A `required` rule on a checkbox means it must be ticked.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { terms: false } })
    const value = useFieldValue(form, 'terms')
    return (
      <Form form={form} aria-label="CheckboxField example">
        <Stack gap={4}>
          <form.CheckboxField
            name="terms"
            label="I've read the terms of carriage"
            description="Including the rules for bikes and dogs"
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
