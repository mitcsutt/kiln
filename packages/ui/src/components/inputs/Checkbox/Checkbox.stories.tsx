import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { CheckboxField } from '#components/inputs/CheckboxField'

const meta = {
  title: 'UI/Inputs/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Paid', size: 'md', invalid: false, disabled: false },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: () => (
    <Inline gap={5}>
      <Checkbox aria-label="Unchecked" />
      <Checkbox aria-label="Checked" defaultChecked />
      <Checkbox aria-label="Some" checked="indeterminate" />
      <Checkbox aria-label="Invalid" invalid />
      <Checkbox aria-label="Disabled" disabled />
      <Checkbox aria-label="Disabled checked" disabled defaultChecked />
    </Inline>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Inline gap={5}>
      <Checkbox aria-label="Small" size="sm" defaultChecked />
      <Checkbox aria-label="Medium" size="md" defaultChecked />
      <Checkbox aria-label="Large" size="lg" defaultChecked />
    </Inline>
  ),
}

const steps = ['Update the changelog', 'Run the migrations', 'Tag the release', 'Email customers']

/** A "select all" parent is indeterminate while some — not all — children are ticked. */
export const SelectAll: Story = {
  render: function SelectAllStory() {
    const [done, setDone] = useState<string[]>(['Update the changelog', 'Tag the release'])
    const all = done.length === steps.length
    return (
      <Stack gap={3}>
        <CheckboxField
          label="Mark every release step done"
          checked={all ? true : done.length > 0 ? 'indeterminate' : false}
          onCheckedChange={(on) => {
            setDone(on && !all ? steps : [])
          }}
        />
        <Stack gap={3} style={{ paddingInlineStart: 'var(--space-6)' }}>
          {steps.map((step) => (
            <CheckboxField
              key={step}
              label={step}
              checked={done.includes(step)}
              onCheckedChange={(on) => {
                setDone((p) => (on ? [...p, step] : p.filter((s) => s !== step)))
              }}
            />
          ))}
        </Stack>
      </Stack>
    )
  },
}

const LEGS = ['Harbour Square to Kelso Bay', 'Kelso Bay to Marram Point']

/**
 * A parent checkbox that turns indeterminate when only some of its legs are chosen.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [chosen, setChosen] = useState<string[]>([LEGS[0] ?? ''])
    const all = chosen.length === LEGS.length
    return (
      <Stack gap={3}>
        <Inline gap={3}>
          <Checkbox
            aria-label="Select both legs"
            checked={all ? true : chosen.length ? 'indeterminate' : false}
            onCheckedChange={() => {
              setChosen(all ? [] : LEGS)
            }}
          />
          <Text weight="medium">Both legs</Text>
        </Inline>
        {LEGS.map((leg) => (
          <Inline key={leg} gap={3}>
            <Checkbox
              aria-label={leg}
              checked={chosen.includes(leg)}
              onCheckedChange={(checked) => {
                setChosen((current) =>
                  checked === true ? [...current, leg] : current.filter((item) => item !== leg),
                )
              }}
            />
            <Text>{leg}</Text>
          </Inline>
        ))}
      </Stack>
    )
  },
}
