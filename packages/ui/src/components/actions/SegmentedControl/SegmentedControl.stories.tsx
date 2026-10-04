import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MoonIcon, SunIcon, SystemIcon } from '#icons'
import { Stack } from '#components/layout/Stack'
import { SegmentedControl } from './SegmentedControl'

const periods = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

const meta = {
  title: 'UI/Actions/SegmentedControl',
  component: SegmentedControl,
  args: {
    'aria-label': 'Budget period',
    options: periods,
    size: 'md',
    fullWidth: false,
    iconOnly: false,
  },
  argTypes: { options: { control: false } },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A league's table views, composed from Items and controlled. */
export const StandingsViews: Story = {
  render: function Render() {
    const [view, setView] = useState('table')
    return (
      <SegmentedControl aria-label="Standings view" value={view} onValueChange={setView}>
        <SegmentedControl.Item value="groups">Divisions</SegmentedControl.Item>
        <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
        <SegmentedControl.Item value="bracket">Cup</SegmentedControl.Item>
      </SegmentedControl>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={4} align="start">
      <SegmentedControl aria-label="Period" size="sm" options={periods} defaultValue="quarter" />
      <SegmentedControl aria-label="Period" size="md" options={periods} defaultValue="quarter" />
      <SegmentedControl aria-label="Period" size="lg" options={periods} defaultValue="quarter" />
    </Stack>
  ),
}

/** Full width on a phone-sized squad page: "Teams | Players". */
export const FullWidth: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Squad view"
      fullWidth
      options={[
        { value: 'teams', label: 'Teams' },
        { value: 'players', label: 'Players' },
      ]}
    />
  ),
}

/**
 * Responsive: a large, full-width control on phones (thumb-sized segments across the
 * screen), a medium inline one from `md` up. Resize the frame across 768px.
 */
export const ResponsiveSizing: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Fixtures"
      size={{ base: 'lg', md: 'md' }}
      fullWidth={{ base: true, md: false }}
      options={[
        { value: 'groups', label: 'Groups' },
        { value: 'table', label: 'Table' },
        { value: 'bracket', label: 'Bracket' },
      ]}
      defaultValue="table"
    />
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Stack gap={4} align="start">
      <SegmentedControl
        aria-label="Colour mode"
        options={[
          { value: 'light', label: 'Light', icon: <SunIcon /> },
          { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
          { value: 'system', label: 'System', icon: <SystemIcon /> },
        ]}
        defaultValue="dark"
      />
      <SegmentedControl
        aria-label="Colour mode"
        iconOnly
        size="sm"
        options={[
          { value: 'light', label: 'Light', icon: <SunIcon /> },
          { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
          { value: 'system', label: 'System', icon: <SystemIcon /> },
        ]}
        defaultValue="system"
      />
    </Stack>
  ),
}

export const Disabled: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Fixtures"
      options={[
        { value: 'played', label: 'Played' },
        { value: 'today', label: 'Today' },
        { value: 'upcoming', label: 'Upcoming', disabled: true },
      ]}
      defaultValue="today"
    />
  ),
}
