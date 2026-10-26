import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm } from '@mitcsutt/kiln-forms'
import { SegmentedControl, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'

const meta = {
  title: 'Forms/Getting started/View mode',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Select fields show the option's label, amounts are formatted for their currency, switches read
 * "Yes" or "No", and anything empty reads "Not provided". Passwords are always a fixed-length
 * mask, so the view doesn't even leak the length.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [mode, setMode] = useState<'edit' | 'view'>('view')
    const form = useAppForm({
      defaultValues: {
        name: 'Ines Varga',
        pass: 'annual',
        fare: 790,
        alerts: true,
        days: ['mon', 'wed', 'fri'] as string[],
      },
    })
    return (
      <Stack gap={5}>
        <SegmentedControl
          aria-label="Mode"
          value={mode}
          onValueChange={(value) => {
            setMode(value === 'edit' ? 'edit' : 'view')
          }}
          options={[
            { value: 'view', label: 'View' },
            { value: 'edit', label: 'Edit' },
          ]}
        />
        <Form form={form} mode={mode} aria-label="Pass holder">
          <Stack gap={5}>
            <form.TextField name="name" label="Name" />
            <form.SelectField
              name="pass"
              label="Pass"
              options={[
                { value: 'week', label: 'Week pass' },
                { value: 'annual', label: 'Annual pass' },
              ]}
            />
            <form.AmountField name="fare" label="Paid" currency="GBP" locale="en-GB" />
            <form.SwitchField name="alerts" label="Delay alerts" />
            <form.ChipsField
              name="days"
              label="Travel days"
              options={['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => ({
                value: day,
                label: day.charAt(0).toUpperCase() + day.slice(1),
              }))}
            />
          </Stack>
        </Form>
      </Stack>
    )
  },
}

/**
 * `viewLines` on `Form` (or on a `FormReview`) clamps each value to about that many lines, with a
 * "Show more" toggle, so one long answer doesn't push the rest of a detail page out of sight.
 * Values that fit show no toggle, and the toggle's text comes from `messages.showMore` and
 * `messages.showLess`.
 */
export const LongValues: Story = {
  name: 'Long values',
  tags: ['docs'],
  render: function LongValues() {
    const form = useAppForm({
      defaultValues: {
        venue: 'Harbour Hall, east wing',
        access:
          'Step-free entry is by the loading bay on Quay Street; ring the bell and the stage ' +
          'manager will meet you. The lift to the first floor takes one wheelchair and one ' +
          'companion at a time, and the accessible toilets are next to the green room. Hearing ' +
          'loops cover the first six rows. Parking for blue badge holders is in the courtyard, ' +
          'booked through the front desk by noon the day before.',
      },
    })
    return (
      <Form form={form} mode="view" viewLines={2} aria-label="Venue details">
        <Stack gap={5}>
          <form.TextField name="venue" label="Venue" />
          <form.TextareaField name="access" label="Access notes" />
        </Stack>
      </Form>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const toggle = await canvas.findByRole('button', { name: 'Show more' }, { timeout: 5000 })
    await expect(canvas.getAllByRole('button')).toHaveLength(1)
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle).toHaveAccessibleName('Show less')
  },
}
