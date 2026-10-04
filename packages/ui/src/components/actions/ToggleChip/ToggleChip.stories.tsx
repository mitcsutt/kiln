import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CheckIcon } from '#icons'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { ToggleChip } from './ToggleChip'

const meta = {
  title: 'UI/Actions/ToggleChip',
  component: ToggleChip,
  args: { children: 'Mine', size: 'md', defaultPressed: false },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof ToggleChip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A squad list's filters: each chip is independent — this is not a radio group. */
export const FilterBar: Story = {
  render: function Render() {
    const [mine, setMine] = useState(true)
    const [grouped, setGrouped] = useState(false)
    const [scorers, setScorers] = useState(false)
    return (
      <Inline gap={2}>
        <ToggleChip pressed={mine} onPressedChange={setMine} count={6}>
          Starters
        </ToggleChip>
        <ToggleChip pressed={grouped} onPressedChange={setGrouped}>
          Group by position
        </ToggleChip>
        <ToggleChip pressed={scorers} onPressedChange={setScorers} count={41}>
          Scorers only
        </ToggleChip>
      </Inline>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={4}>
      <Inline gap={2}>
        <ToggleChip size="sm">Groceries</ToggleChip>
        <ToggleChip size="sm" defaultPressed>
          Utilities
        </ToggleChip>
        <ToggleChip size="sm" count={3}>
          Recurring
        </ToggleChip>
      </Inline>
      <Inline gap={2}>
        <ToggleChip size="md">Groceries</ToggleChip>
        <ToggleChip size="md" defaultPressed>
          Utilities
        </ToggleChip>
        <ToggleChip size="md" count={3}>
          Recurring
        </ToggleChip>
      </Inline>
    </Stack>
  ),
}

export const States: Story = {
  render: () => (
    <Inline gap={2}>
      <ToggleChip>Off</ToggleChip>
      <ToggleChip defaultPressed>On</ToggleChip>
      <ToggleChip defaultPressed icon={<CheckIcon />}>
        Reconciled
      </ToggleChip>
      <ToggleChip disabled count={0}>
        Eliminated
      </ToggleChip>
    </Inline>
  ),
}
