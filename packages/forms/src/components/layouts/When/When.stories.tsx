import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, SubmitButton, useAppForm, When } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { whenFixture, whenSchema } from '#stories/fixtures/flow'
import { StoryForm, storyRoot } from '#stories/_kit'
import { parityStory } from '#stories/parity'

// `When` is generic over the form, so the meta names no `component`.
const meta = {
  title: 'Forms/Layouts/When',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const methods = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Collect from the shop' },
]

/** Choose "Collect from the shop": the address field unmounts and the collection time appears. */
export const Playground: Story = {
  render: () => (
    <StoryForm label="Order" defaultValues={{ method: 'delivery', address: '', pickupTime: '' }}>
      {(form) => (
        <>
          <form.RadioField name="method" label="How do you want your order?" options={methods} />
          <When form={form} is={(values) => values.method === 'delivery'}>
            <form.TextareaField name="address" label="Delivery address" />
          </When>
          <When form={form} is={(values) => values.method === 'pickup'}>
            <form.TimeField name="pickupTime" label="Collection time" />
          </When>
        </>
      )}
    </StoryForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.getByLabelText('Delivery address')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('radio', { name: 'Collect from the shop' }))
    await expect(canvas.queryByLabelText('Delivery address')).not.toBeInTheDocument()
    await expect(canvas.getByLabelText('Collection time')).toBeInTheDocument()
  },
}

/** Switch to "Collect from the shop": the address unmounts and is pruned from the output. */
export const ComponentAndSchema: Story = parityStory(whenFixture, whenSchema, ['When'])

/**
 * Choose "Post it to me", type an address, switch back to collecting, and submit: the address is
 * submitted empty.
 *
 * - `is` takes a function of the values. `condition` takes the JSON condition schema mode uses.
 * - `whenHidden` is `'prune'` (the default), `'keep'` (submit the hidden value anyway) or
 *   `'reset'` (clear it as soon as it hides).
 * - `names` lists paths the block governs that haven't been shown yet, such as a hidden server
 *   value in an edit form.
 * - `fallback` renders in place of the children while hidden.
 *
 * It re-renders only when visibility flips, not on every change.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [submitted, setSubmitted] = useState('')
    const form = useAppForm({
      defaultValues: { delivery: 'collect', address: '' },
      onSubmit: ({ value }) => {
        setSubmitted(JSON.stringify(value))
      },
    })
    return (
      <Form form={form} aria-label="Pass delivery">
        <Stack gap={5}>
          <form.RadioField
            name="delivery"
            label="How do you want your pass?"
            options={[
              { value: 'collect', label: 'Collect it at Harbour Square' },
              { value: 'post', label: 'Post it to me' },
            ]}
          />
          <When form={form} is={(values) => values.delivery === 'post'}>
            <form.TextareaField
              name="address"
              label="Postal address"
              autoComplete="street-address"
            />
          </When>
          <SubmitButton>Order pass</SubmitButton>
          {submitted ? (
            <Text size="sm" tone="muted">
              Submitted: <Code>{submitted}</Code>
            </Text>
          ) : null}
        </Stack>
      </Form>
    )
  },
}
