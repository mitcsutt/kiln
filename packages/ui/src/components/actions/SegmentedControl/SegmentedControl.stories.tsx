import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoonIcon, SegmentedControl, Stack, SunIcon, SystemIcon, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

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

/**
 * Pass segments as `options`, or compose `SegmentedControl.Item`s. Control it with `value` and
 * `onValueChange`, or use `defaultValue`. Segments are always equal widths.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [view, setView] = useState('list')
    return (
      <Stack gap={3} align="start">
        <SegmentedControl aria-label="Timetable view" value={view} onValueChange={setView}>
          <SegmentedControl.Item value="list">List</SegmentedControl.Item>
          <SegmentedControl.Item value="map">Map</SegmentedControl.Item>
          <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
        </SegmentedControl>
        <Text size="sm" tone="muted">
          Showing the {view} view
        </Text>
      </Stack>
    )
  },
}

/**
 * `size` and `fullWidth` take responsive values: a large, full-width control with thumb-sized
 * segments on a phone, and a medium inline one from `md` up.
 */
export const Responsive: Story = {
  name: 'Responsive sizing',
  tags: ['docs'],
  render: function Responsive() {
    return (
      <SegmentedControl
        aria-label="Departures"
        size={{ base: 'lg', md: 'md' }}
        fullWidth={{ base: true, md: false }}
        defaultValue="today"
        options={[
          { value: 'today', label: 'Today' },
          { value: 'tomorrow', label: 'Tomorrow' },
          { value: 'weekend', label: 'Weekend' },
        ]}
      />
    )
  },
}

const MODES = [
  { value: 'light', label: 'Light', icon: <SunIcon /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
  { value: 'system', label: 'System', icon: <SystemIcon /> },
]

/**
 * Segments can carry an icon. With `iconOnly`, the labels become each segment's accessible name.
 */
export const Icons: Story = {
  tags: ['docs'],
  render: function Icons() {
    return (
      <Stack gap={4} align="start">
        <SegmentedControl aria-label="Map style" options={MODES} defaultValue="dark" />
        <SegmentedControl
          aria-label="Map style"
          iconOnly
          size="sm"
          options={MODES}
          defaultValue="system"
        />
      </Stack>
    )
  },
}
