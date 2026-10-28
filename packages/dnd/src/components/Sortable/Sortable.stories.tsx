import type { Meta, StoryObj } from '@storybook/react-vite'
import { DragHandle, Sortable } from '@mitcsutt/kiln-dnd'
import { Button, Inline, Link, Stack, Tag, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { announcement, drag, expectAnnouncement, storyRoot } from '#stories/play'

interface Task {
  id: string
  title: string
  owner: string
}

const releaseTasks: Task[] = [
  { id: 'notes', title: 'Write the 2.4 release notes', owner: 'Priya Nair' },
  { id: 'qa', title: 'Run the QA pass on Android', owner: 'Tomás Ortega' },
  { id: 'tag', title: 'Tag v2.4.0 and build the installers', owner: 'Hana Kobayashi' },
  { id: 'post', title: 'Post the changelog to the forum', owner: 'Ama Owusu' },
  { id: 'mail', title: 'Email the 312 beta testers', owner: 'Priya Nair' },
]

const meta = {
  title: 'Drag and drop/Components/Sortable',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const titles = (list: HTMLElement) =>
  [...list.querySelectorAll(':scope > li')].map((li) => li.textContent.trim())

function Checklist() {
  return (
    <Sortable label="Release checklist" defaultItems={releaseTasks} getLabel={(task) => task.title}>
      {(task) => task.title}
    </Sortable>
  )
}

/** Keyboard: pick up, move twice, drop. Focus stays on the item and every step is said. */
export const Playground: Story = {
  render: () => <Checklist />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const list = canvas.getByRole('list', { name: 'Release checklist' })
    const item = canvas.getByText('Write the 2.4 release notes')
    item.focus()
    await userEvent.keyboard(' ')
    await expectAnnouncement(root, 'Picked up Write the 2.4 release notes, position 1 of 5.')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expectAnnouncement(root, 'Write the 2.4 release notes moved to position 3 of 5.')
    await expect(titles(list)[0]).toBe('Write the 2.4 release notes')
    await userEvent.keyboard('{Enter}')
    await expectAnnouncement(root, 'Dropped Write the 2.4 release notes at position 3 of 5.')
    await expect(titles(list)[2]).toBe('Write the 2.4 release notes')
    await expect(canvas.getByText('Write the 2.4 release notes')).toHaveFocus()

    await userEvent.keyboard(' {ArrowUp}{Escape}')
    await expectAnnouncement(
      root,
      'Move cancelled. Write the 2.4 release notes is back at position 3 of 5.',
    )
    await expect(canvas.getByText('Write the 2.4 release notes')).toHaveFocus()
  },
}

/**
 * A list that keeps its own order: pass `defaultItems`. Drag a row, or focus it and press
 * Space, then use the arrow keys. A line shows where it will land.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Sortable
        label="Release checklist"
        defaultItems={[
          { id: 'notes', title: 'Write the 2.4 release notes' },
          { id: 'qa', title: 'Run the QA pass on Android' },
          { id: 'tag', title: 'Tag v2.4.0 and build the installers' },
          { id: 'post', title: 'Post the changelog to the forum' },
        ]}
        getLabel={(task) => task.title}
      >
        {(task) => task.title}
      </Sortable>
    )
  },
}

/**
 * Own the order with `items` and `onChange`. `onChange` fires once per drop with the new
 * array, so it can go straight into state or to your API.
 */
export const Controlled: Story = {
  tags: ['docs'],
  render: function Controlled() {
    const [tasks, setTasks] = useState([
      { id: 'notes', title: 'Release notes' },
      { id: 'qa', title: 'QA pass' },
      { id: 'tag', title: 'Tag and build' },
    ])
    return (
      <Stack gap={4}>
        <Sortable
          label="Launch steps"
          items={tasks}
          onChange={setTasks}
          getLabel={(task) => task.title}
        >
          {(task) => task.title}
        </Sortable>
        <Text tone="muted" size="sm">
          Order: {tasks.map((task) => task.title).join(', ')}
        </Text>
      </Stack>
    )
  },
}

/**
 * Rows with their own links and buttons drag by a `DragHandle`, so a click on the link
 * stays a click. Set `handle` and put the handle in each row.
 */
export const WithHandles: Story = {
  tags: ['docs'],
  render: function WithHandles() {
    return (
      <Sortable
        label="Speakers, in running order"
        defaultItems={[
          { id: 'okafor', name: 'Chidi Okafor', talk: 'Ten years of offline sync' },
          { id: 'lind', name: 'Maja Lind', talk: 'Designing for slow phones' },
          { id: 'reyes', name: 'Lucía Reyes', talk: 'What our support inbox taught us' },
        ]}
        getLabel={(speaker) => speaker.name}
        handle
      >
        {(speaker) => (
          <Inline gap={3} align="center" justify="between">
            <Inline gap={3} align="center">
              <DragHandle />
              <Stack gap={1}>
                <Link href={`#${speaker.id}`}>{speaker.name}</Link>
                <Text size="sm" tone="muted">
                  {speaker.talk}
                </Text>
              </Stack>
            </Inline>
            <Button size="sm" variant="ghost">
              Edit
            </Button>
          </Inline>
        )}
      </Sortable>
    )
  },
}

/** `orientation="horizontal"` for a row: Left and Right move the item along it. */
export const Horizontal: Story = {
  tags: ['docs'],
  render: function Horizontal() {
    return (
      <Sortable
        label="Filter order"
        orientation="horizontal"
        defaultItems={[
          { id: 'status', label: 'Status' },
          { id: 'owner', label: 'Owner' },
          { id: 'due', label: 'Due date' },
          { id: 'region', label: 'Region' },
        ]}
        getLabel={(filter) => filter.label}
      >
        {(filter) => <Tag>{filter.label}</Tag>}
      </Sortable>
    )
  },
}

/** Pointer: drag the first row below the third. The list changes once, on drop. */
export const PointerDrag: Story = {
  render: () => <Checklist />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const list = canvas.getByRole('list', { name: 'Release checklist' })
    const first = canvas.getByText('Write the 2.4 release notes')
    const third = canvas.getByText('Tag v2.4.0 and build the installers')
    const rect = third.getBoundingClientRect()
    const drop = await drag(first, { x: rect.left + 20, y: rect.bottom - 2 }, { keepHolding: true })
    // The pick-up can already be replaced by a move announcement once the pointer reaches the
    // third row, so check only that the live region names the item.
    await waitFor(async () => {
      await expect(announcement(root)).toContain('Write the 2.4 release notes')
    })
    await waitFor(async () => {
      await expect(canvas.getByText('Post the changelog to the forum')).toHaveAttribute(
        'data-drop-edge',
        'before',
      )
    })
    await expect(titles(list)[0]).toBe('Write the 2.4 release notes')
    await drop()
    await waitFor(async () => {
      await expect(titles(list)).toEqual([
        'Run the QA pass on Android',
        'Tag v2.4.0 and build the installers',
        'Write the 2.4 release notes',
        'Post the changelog to the forum',
        'Email the 312 beta testers',
      ])
    })
    await expectAnnouncement(root, 'Dropped Write the 2.4 release notes at position 3 of 5.')
  },
}

/** Pointer, then Escape: the drag is cancelled and the list stays as it was. */
export const PointerCancel: Story = {
  render: () => <Checklist />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const list = canvas.getByRole('list', { name: 'Release checklist' })
    const before = titles(list)
    const first = canvas.getByText('Write the 2.4 release notes')
    const last = canvas.getByText('Email the 312 beta testers')
    const drop = await drag(first, last, { keepHolding: true })
    await expectAnnouncement(root, 'Picked up Write the 2.4 release notes, position 1 of 5.')
    await userEvent.keyboard('{Escape}')
    await expectAnnouncement(
      root,
      'Move cancelled. Write the 2.4 release notes is back at position 1 of 5.',
    )
    await drop()
    // The engine removes the copy it left in place once the cancelled drag winds down.
    await waitFor(async () => {
      await expect(titles(list)).toEqual(before)
    })
    await expect(root.querySelector('[data-drop-edge]')).toBeNull()
    await expect(root.querySelector('[data-dnd-placeholder]')).toBeNull()
  },
}
