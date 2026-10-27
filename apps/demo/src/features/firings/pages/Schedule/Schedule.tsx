import { DragHandle, Sortable } from '@mitcsutt/kiln-dnd'
import { Inline, SectionHeader, Stack, Stepper, Text, type StepperStep } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import { PageHeader } from '#components/PageHeader'

import { BookSlot } from './components/BookSlot'
import { LoadingBay } from './components/LoadingBay'
import { ShelfPlan } from './components/ShelfPlan'

const STAGES = [
  { value: 'greenware', label: 'Greenware', description: 'Bone dry' },
  { value: 'bisque', label: 'Bisque', description: '1000°C' },
  { value: 'glazing', label: 'Glazing' },
  { value: 'glaze', label: 'Glaze firing', description: 'Cone 6' },
  { value: 'done', label: 'Collected' },
]

const QUEUE = [
  { id: 'q1', title: 'Saturday class bisque, 22 pieces' },
  { id: 'q2', title: 'Café planters, glaze' },
  { id: 'q3', title: 'Tenmoku test tiles' },
  { id: 'q4', title: 'Raku night, outdoor kiln' },
]

/** What goes in which kiln, in what order, and when. */
export function Schedule() {
  const [stage, setStage] = useState('glazing')
  const index = STAGES.findIndex((s) => s.value === stage)
  const steps: StepperStep[] = STAGES.map((s, i) => ({
    ...s,
    status: i < index ? 'complete' : i === index ? 'current' : 'upcoming',
  }))
  return (
    <Stack gap={8}>
      <PageHeader
        kicker="Kiln room"
        title="Loading schedule"
        description="Every list here reorders by pointer, touch or keyboard: focus an item, press space, then the arrow keys."
        theme="flightdeck"
      />
      <Stack gap={4}>
        <SectionHeader
          level={2}
          size="lg"
          title="The café order"
          description="Where 14 planters are in the making."
        />
        <Stepper steps={steps} value={stage} onStepSelect={setStage} compactBelow="sm" />
      </Stack>
      <Stack gap={4}>
        <SectionHeader
          level={2}
          size="lg"
          title="Firing queue"
          description="Top of the list fires next."
        />
        <Sortable
          label="Firing queue"
          defaultItems={QUEUE}
          getLabel={(firing) => firing.title}
          handle
        >
          {(firing) => (
            <Inline gap={3} align="center">
              <DragHandle />
              <Text>{firing.title}</Text>
            </Inline>
          )}
        </Sortable>
      </Stack>
      <Stack gap={4}>
        <SectionHeader
          level={2}
          size="lg"
          title="Loading bay"
          description="Drag each piece to its kiln."
        />
        <LoadingBay />
      </Stack>
      <Stack gap={4}>
        <SectionHeader level={2} size="lg" title="Kiln 1 shelf plan" />
        <ShelfPlan />
      </Stack>
      <BookSlot />
    </Stack>
  )
}
