import {
  arrayMove,
  Dnd,
  DragHandle,
  SortableItem,
  useDraggable,
  useDroppable,
  useSortable,
} from '@mitcsutt/kiln-dnd'
import { Badge, Inline, Stack, Table, Tag, Text } from '@mitcsutt/kiln-ui'
import { useState, type ReactNode } from 'react'

interface Shelf {
  id: string
  name: string
  height: string
}

const SHELVES: Shelf[] = [
  { id: 's1', name: 'Bottom shelf', height: '18 cm' },
  { id: 's2', name: 'Second shelf', height: '14 cm' },
  { id: 's3', name: 'Third shelf', height: '14 cm' },
  { id: 's4', name: 'Top shelf', height: '10 cm' },
]

/** The table body is the list's container, so a shelf can land after the last one. */
function ShelfRows({ children }: { children: ReactNode }) {
  const { ref } = useDroppable({ id: 'shelves', label: 'Shelves in kiln 1', list: 'shelves' })
  return <Table.Body ref={ref}>{children}</Table.Body>
}

/** Cones are small things you pick up: plain markup made draggable with the hook. */
function ConePack({ cone }: { cone: string }) {
  const { ref, handleProps, isDragging } = useDraggable({
    id: `cone-${cone}`,
    label: `Cone ${cone} pack`,
  })
  return (
    <span ref={ref} {...handleProps}>
      <Tag color={isDragging ? 3 : undefined}>Cone {cone}</Tag>
    </span>
  )
}

/** A spy-hole slot that takes a cone pack. */
function SpyHole({ cone, onDrop }: { cone: string | null; onDrop: (label: string) => void }) {
  const { ref, isOver } = useDroppable({
    id: 'spy-hole',
    label: 'Spy hole',
    onDrop: (item) => {
      onDrop(item.label)
    },
  })
  return (
    <div ref={ref}>
      <Text size="sm" tone={isOver ? 'accent' : 'muted'}>
        {cone ? `${cone} at the spy hole` : 'Drop a cone pack at the spy hole'}
      </Text>
    </div>
  )
}

/** Steps for unloading, in an ordered list built straight on `useSortable`. */
function UnloadStep({ step, index }: { step: string; index: number }) {
  const { ref, handleProps, isDragging, dropEdge } = useSortable({
    id: step,
    index,
    label: step,
    list: 'unload',
  })
  return (
    <li ref={ref} {...handleProps} data-drop-edge={dropEdge ?? undefined}>
      <Text size="sm" tone={isDragging ? 'muted' : 'default'}>
        {index + 1}. {step}
      </Text>
    </li>
  )
}

function UnloadSteps({ steps }: { steps: string[] }) {
  const { ref } = useDroppable({ id: 'unload', label: 'Unloading steps', list: 'unload' })
  return (
    <ol ref={ref} aria-label="Unloading steps">
      {steps.map((step, index) => (
        <UnloadStep key={step} step={step} index={index} />
      ))}
    </ol>
  )
}

/** Kiln 1's shelves top to bottom, its cone pack, and the unloading checklist, all reorderable. */
export function ShelfPlan() {
  const [shelves, setShelves] = useState(SHELVES)
  const [cone, setCone] = useState<string | null>(null)
  const [steps, setSteps] = useState([
    'Check the kiln is under 100°C',
    'Open the bung',
    'Lift the top shelf',
    'Log the cone result',
  ])
  return (
    <Dnd
      onDragEnd={({ item, target }) => {
        if (target?.kind !== 'list' || item.index === undefined) return
        const from = item.index
        if (target.list === 'shelves')
          setShelves((current) => arrayMove(current, from, target.index))
        if (target.list === 'unload') setSteps((current) => arrayMove(current, from, target.index))
      }}
    >
      <Stack gap={5}>
        <Table aria-label="Shelves in kiln 1" density="compact">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell width="min">Order</Table.HeaderCell>
              <Table.HeaderCell>Shelf</Table.HeaderCell>
              <Table.HeaderCell numeric>Clearance</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <ShelfRows>
            {shelves.map((shelf, index) => (
              <SortableItem
                key={shelf.id}
                id={shelf.id}
                index={index}
                label={shelf.name}
                list="shelves"
                handle
              >
                {({ ref, props }) => (
                  <Table.Row ref={ref} {...props}>
                    <Table.Cell>
                      <DragHandle />
                    </Table.Cell>
                    <Table.Cell>{shelf.name}</Table.Cell>
                    <Table.Cell numeric>{shelf.height}</Table.Cell>
                  </Table.Row>
                )}
              </SortableItem>
            ))}
          </ShelfRows>
        </Table>
        <Inline gap={3} align="center">
          <ConePack cone="5" />
          <ConePack cone="6" />
          <ConePack cone="7" />
          <SpyHole cone={cone} onDrop={setCone} />
          {cone ? <Badge tone="positive">Set</Badge> : null}
        </Inline>
        <UnloadSteps steps={steps} />
      </Stack>
    </Dnd>
  )
}
