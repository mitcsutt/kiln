import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon, Inline, ToggleChip } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Actions/ToggleChip',
  component: ToggleChip,
  args: { children: 'Mine', size: 'md', defaultPressed: false },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof ToggleChip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A task list's filters: each chip is independent — this is not a radio group. */
export const FilterBar: Story = {
  render: function Render() {
    const [mine, setMine] = useState(true)
    const [grouped, setGrouped] = useState(false)
    const [overdue, setOverdue] = useState(false)
    return (
      <Inline gap={2}>
        <ToggleChip pressed={mine} onPressedChange={setMine} count={6}>
          Assigned to me
        </ToggleChip>
        <ToggleChip pressed={grouped} onPressedChange={setGrouped}>
          Group by project
        </ToggleChip>
        <ToggleChip pressed={overdue} onPressedChange={setOverdue} count={4}>
          Overdue only
        </ToggleChip>
      </Inline>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline gap={2}>
        <ToggleChip size="sm">Design</ToggleChip>
        <ToggleChip size="sm" defaultPressed>
          Engineering
        </ToggleChip>
        <ToggleChip size="sm" count={3}>
          Recurring
        </ToggleChip>
      </Inline>
      <Inline gap={2}>
        <ToggleChip size="md">Design</ToggleChip>
        <ToggleChip size="md" defaultPressed>
          Engineering
        </ToggleChip>
        <ToggleChip size="md" count={3}>
          Recurring
        </ToggleChip>
      </Inline>
    </Stack>
  ),
}

/**
 * `count` shows how many results the filter covers. Control it with `pressed` and
 * `onPressedChange`, or let it manage itself with `defaultPressed`.
 */
export const Filters: Story = {
  tags: ['docs'],
  render: function Filters() {
    const [step, setStep] = useState(true)
    const [night, setNight] = useState(false)
    const [bikes, setBikes] = useState(false)
    return (
      <Inline gap={2}>
        <ToggleChip pressed={step} onPressedChange={setStep} count={14}>
          Step-free
        </ToggleChip>
        <ToggleChip pressed={night} onPressedChange={setNight} count={5}>
          Runs at night
        </ToggleChip>
        <ToggleChip pressed={bikes} onPressedChange={setBikes}>
          Bikes allowed
        </ToggleChip>
      </Inline>
    )
  },
}

/**
 * Small, off, on, on with an icon, and disabled with a count.
 */
export const States: Story = {
  name: 'States and sizes',
  tags: ['docs'],
  render: function States() {
    return (
      <Inline gap={2}>
        <ToggleChip size="sm">Small</ToggleChip>
        <ToggleChip>Off</ToggleChip>
        <ToggleChip defaultPressed>On</ToggleChip>
        <ToggleChip defaultPressed icon={<CheckIcon />}>
          Verified
        </ToggleChip>
        <ToggleChip disabled count={0}>
          Suspended
        </ToggleChip>
      </Inline>
    )
  },
}
