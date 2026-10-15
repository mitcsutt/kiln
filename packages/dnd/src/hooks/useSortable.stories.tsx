import type { Meta, StoryObj } from '@storybook/react-vite'
import { arrayMove, Dnd, useDroppable, useSortable } from '@mitcsutt/kiln-dnd'
import { Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { expectAnnouncement, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Hooks/useSortable',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Step({ step, index }: { step: string; index: number }) {
  const { ref, handleProps, isDragging, dropEdge } = useSortable({ id: step, index, label: step })
  return (
    <li ref={ref} {...handleProps} data-drop-edge={dropEdge ?? undefined}>
      <Text tone={isDragging ? 'muted' : 'default'}>{step}</Text>
    </li>
  )
}

function StepList({ steps }: { steps: string[] }) {
  // The container: an item dropped past the last step lands at the end.
  const { ref } = useDroppable({ id: 'steps', label: 'Onboarding steps', list: 'list' })
  return (
    <ol ref={ref} aria-label="Onboarding steps">
      {steps.map((step, index) => (
        <Step key={step} step={step} index={index} />
      ))}
    </ol>
  )
}

function OnboardingSteps() {
  const [steps, setSteps] = useState([
    'Create the workspace',
    'Invite the team',
    'Connect the bank',
  ])
  return (
    <Dnd
      onDragEnd={({ item, target }) => {
        if (target?.kind === 'list' && item.index !== undefined) {
          const from = item.index
          setSteps((current) => arrayMove(current, from, target.index))
        }
      }}
    >
      <StepList steps={steps} />
    </Dnd>
  )
}

/** Keyboard on hand-built markup: the same keys and announcements as `Sortable`. */
export const Playground: Story = {
  render: () => <OnboardingSteps />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    canvas.getByText('Connect the bank').closest('li')?.focus()
    await userEvent.keyboard(' {ArrowUp}{ArrowUp} ')
    await expectAnnouncement(root, 'Dropped Connect the bank at position 1 of 3.')
    const items = canvas.getAllByRole('listitem').map((li) => li.textContent)
    await expect(items[0]).toBe('Connect the bank')
  },
}

/**
 * Your own markup: one `useSortable` per item and `arrayMove` in `Dnd`'s `onDragEnd`.
 * `dropEdge` says where to draw the drop line; `useDroppable({ list })` on the container
 * lets an item land past the last one.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return <OnboardingSteps />
  },
}
