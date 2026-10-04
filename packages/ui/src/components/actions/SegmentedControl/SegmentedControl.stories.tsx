import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
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
    'aria-label': 'Reporting period',
    options: periods,
    size: 'md',
    fullWidth: false,
    iconOnly: false,
  },
  argTypes: { options: { control: false } },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

/** One option is always chosen. Arrow keys move focus and Space chooses. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const quarter = canvas.getByRole('radio', { name: 'Quarter' })
    await userEvent.click(quarter)
    await expect(quarter).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('{ArrowRight}')
    const year = canvas.getByRole('radio', { name: 'Year' })
    await expect(year).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(year).toHaveAttribute('aria-checked', 'true')
  },
}

/** A project's task views, composed from Items and controlled. */
export const TaskViews: Story = {
  render: function Render() {
    const [view, setView] = useState('table')
    return (
      <SegmentedControl aria-label="Task view" value={view} onValueChange={setView}>
        <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
        <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
        <SegmentedControl.Item value="timeline">Timeline</SegmentedControl.Item>
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

/** Full width on a phone-sized directory page: "Projects | People". */
export const FullWidth: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Directory view"
      fullWidth
      options={[
        { value: 'projects', label: 'Projects' },
        { value: 'people', label: 'People' },
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
      aria-label="Task view"
      size={{ base: 'lg', md: 'md' }}
      fullWidth={{ base: true, md: false }}
      options={[
        { value: 'board', label: 'Board' },
        { value: 'table', label: 'Table' },
        { value: 'timeline', label: 'Timeline' },
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
      aria-label="Releases"
      options={[
        { value: 'shipped', label: 'Shipped' },
        { value: 'today', label: 'Today' },
        { value: 'upcoming', label: 'Upcoming', disabled: true },
      ]}
      defaultValue="today"
    />
  ),
}
