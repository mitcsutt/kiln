import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { Form, FormJsonField, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm, storyRoot } from '#stories/_kit'

const webhook = JSON.stringify(
  { url: 'https://hooks.example.com/orders', events: ['order.paid', 'order.refunded'], retries: 3 },
  null,
  2,
)

const meta = {
  title: 'Forms/Fields/JsonField',
  component: FormJsonField,
  args: { label: 'Webhook settings' },
} satisfies Meta<typeof FormJsonField>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A JSON field bound to `payload`. The value is the text, exactly as written, so text that
 * doesn't parse yet stays in the form until it's fixed. This one starts with a trailing comma:
 * save to see the error, which points at the line and column, then remove the comma and save.
 * The submit handler parses the text.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [sent, setSent] = useState<unknown>(undefined)
    const form = useAppForm({
      defaultValues: { payload: '{\n  "channel": "email",\n  "digest": "weekly",\n}' },
      onSubmit: ({ value }) => {
        setSent(JSON.parse(value.payload))
      },
    })
    return (
      <Form form={form} aria-label="JsonField example">
        <Stack gap={4}>
          <form.JsonField name="payload" label="Notification settings" minRows={6} formatOnBlur />
          <SubmitButton>Save settings</SubmitButton>
          <Text size="sm" tone="muted">
            Sent: <Code>{sent === undefined ? 'nothing yet' : JSON.stringify(sent)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}

/**
 * `validate` gets the parsed value and returns a message to reject it. It blocks submit like
 * text that doesn't parse, and it's where a JSON Schema validator such as Ajv goes. Your own
 * `validators` run on the text after it passes.
 */
export const YourOwnRules: Story = {
  name: 'Your own rules',
  tags: ['docs'],
  render: function YourOwnRules() {
    const form = useAppForm({ defaultValues: { events: '{ "event": "order.paid" }' } })
    return (
      <Form form={form} aria-label="JsonField rules example">
        <Stack gap={4}>
          <form.JsonField
            name="events"
            label="Events to replay"
            description="A list of events, oldest first"
            validate={(value) =>
              Array.isArray(value) ? undefined : 'Put the events in a list, in square brackets'
            }
          />
          <SubmitButton>Replay events</SubmitButton>
        </Stack>
      </Form>
    )
  },
}

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: webhook }} label="Webhook">
      {(form) => (
        <form.JsonField
          name="value"
          label="Webhook settings"
          description="Sent with every order event"
          minRows={6}
          maxRows={16}
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
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => <form.JsonField name="value" label="Webhook settings" />}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: webhook }}>
              {(form) => (
                <form.JsonField
                  name="value"
                  label="Webhook settings"
                  description="Sent with every order event"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Not valid JSON',
          children: (
            <FieldDemo defaultValues={{ value: '{\n  "retries": 3,\n}' }} reveal>
              {(form) => <form.JsonField name="value" label="Webhook settings" />}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: '{ "retries": 12 }' }} reveal>
              {(form) => (
                <form.JsonField
                  name="value"
                  label="Webhook settings"
                  warn={() => 'More than 5 retries can delay other deliveries'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: webhook }}>
              {(form) => <form.JsonField name="value" label="Webhook settings" disabled />}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: webhook }}>
              {(form) => <form.JsonField name="value" label="Webhook settings" readOnly />}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: webhook }} reveal>
              {(form) => (
                <form.JsonField
                  name="value"
                  label="Webhook settings"
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
    <StoryForm defaultValues={{ name: 'Order events', settings: '' }} label="New webhook">
      {(form) => (
        <>
          <form.TextField name="name" label="Webhook name" required />
          <form.JsonField
            name="settings"
            label="Settings"
            description="The URL, the events to send and how often to retry"
            required
            formatOnBlur
          />
        </>
      )}
    </StoryForm>
  ),
}

/** Paste JSON with a trailing comma and submit: the error blocks it until the comma goes. */
export const BlocksInvalidJson: Story = {
  name: 'Blocks text that does not parse',
  render: () => (
    <StoryForm defaultValues={{ settings: '' }} label="Webhook settings form">
      {(form) => <form.JsonField name="settings" label="Settings" />}
    </StoryForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const editor = canvas.getByLabelText('Settings')
    await fireEvent.change(editor, { target: { value: '{ "retries": 3, }' } })
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
    await expect(
      await canvas.findByText('Line 1, column 15: Remove this comma: nothing follows it'),
    ).toBeInTheDocument()
    await fireEvent.change(editor, { target: { value: '{ "retries": 3 }' } })
    await waitFor(() =>
      expect(
        canvas.queryByText('Line 1, column 15: Remove this comma: nothing follows it'),
      ).not.toBeInTheDocument(),
    )
  },
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: webhook.replace(/\s+/g, '') }} mode="view" label="Webhook">
      {(form) => <form.JsonField name="value" label="Webhook settings" />}
    </FieldDemo>
  ),
}
