import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm } from '@mitcsutt/kiln-forms'
import { SegmentedControl, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

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
