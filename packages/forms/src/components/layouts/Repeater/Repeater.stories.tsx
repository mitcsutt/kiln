import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, kit, Repeater, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { dragAndDrop } from '@mitcsutt/kiln-forms/dnd'
import { Stack } from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  repeaterCardsFixture,
  repeaterCardsSchema,
  repeaterDragFixture,
  repeaterDragSchema,
  repeaterListFixture,
  repeaterListSchema,
  repeaterTableFixture,
  repeaterTableSchema,
} from '#stories/fixtures/collections'
import { dndKit, pointerDrag, StoryForm, storyRoot } from '#stories/_kit'
import { parityStory } from '#stories/parity'

// `Repeater` is generic over the form and the array path, so the meta names no `component`.
const meta = {
  title: 'Forms/Layouts/Repeater',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** A guest list of up to four. Add a guest: a new row appears, labelled by its position. */
export const Playground: Story = {
  render: () => (
    <StoryForm
      label="Dinner guests"
      defaultValues={{ guests: [{ name: 'Amara Okafor', dietary: '' }] }}
    >
      {(form) => (
        <Repeater
          form={form}
          name="guests"
          label="Guests"
          newItem={{ name: '', dietary: '' }}
          max={4}
          addLabel="Add guest"
          empty="No guests yet."
        >
          {(item) => (
            <>
              <item.fields.TextField name="name" label="Name" />
              <item.fields.TextField name="dietary" label="Dietary needs" />
            </>
          )}
        </Repeater>
      )}
    </StoryForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.getAllByRole('textbox', { name: /^Name/ })).toHaveLength(1)
    await userEvent.click(canvas.getByRole('button', { name: 'Add guest' }))
    await expect(canvas.getAllByRole('textbox', { name: /^Name/ })).toHaveLength(2)
  },
}

export const List: Story = parityStory(
  repeaterListFixture,
  repeaterListSchema,
  ['Repeater'],
  'List',
)

export const TableParity: Story = parityStory(
  repeaterTableFixture,
  repeaterTableSchema,
  ['Repeater variant="table"'],
  'Table',
)

export const Cards: Story = parityStory(
  repeaterCardsFixture,
  repeaterCardsSchema,
  ['Repeater variant="cards"'],
  'Cards',
)

export const DragParity: Story = parityStory(
  repeaterDragFixture,
  repeaterDragSchema,
  ['Repeater reorderable="drag"'],
  'Drag to reorder',
)

interface Stop {
  place: string
  arrive: string
}

const route: Stop[] = [
  { place: 'Leeds depot', arrive: '07:30' },
  { place: 'York, Fossgate', arrive: '09:15' },
  { place: 'Hull marina', arrive: '11:00' },
  { place: 'Beverley market', arrive: '12:40' },
]

function DeliveryRoute({ variant }: { variant?: 'list' | 'table' | 'cards' }) {
  const form = dndKit.useAppForm({ defaultValues: { stops: route } })
  return (
    <Form form={form} aria-label="Delivery route">
      <Repeater
        form={form}
        name="stops"
        label="Stops"
        variant={variant}
        columns={[{ header: 'Place' }, { header: 'Arrive by', width: 'min' }]}
        newItem={{ place: '', arrive: '' }}
        itemLabel={(index) => `Stop ${String(index + 1)}`}
        reorderable="drag"
        addLabel="Add stop"
      >
        {(item) => (
          <>
            <item.fields.TextField name="place" label="Place" />
            <item.fields.TextField name="arrive" label="Arrive by" />
          </>
        )}
      </Repeater>
    </Form>
  )
}

const places = (root: HTMLElement) =>
  within(root)
    .getAllByRole('textbox', { name: /^Place/ })
    .map((input) => (input as HTMLInputElement).value)

/** By keyboard: pick a stop up by its handle, move it with the arrows, drop it. */
export const DragByKeyboard: Story = {
  render: () => <DeliveryRoute />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const announcer = () => root.querySelector('[data-kiln-dnd-announcer]')?.textContent.trim()
    canvas.getByRole('button', { name: 'Drag Stop 3' }).focus()
    await userEvent.keyboard(' ')
    await waitFor(() => expect(announcer()).toBe('Picked up Stop 3, position 3 of 4.'))
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await waitFor(() => expect(announcer()).toBe('Stop 3 moved to position 1 of 4.'))
    await userEvent.keyboard(' ')
    await waitFor(() => expect(announcer()).toBe('Dropped Stop 3 at position 1 of 4.'))
    await expect(places(root)).toEqual([
      'Hull marina',
      'Leeds depot',
      'York, Fossgate',
      'Beverley market',
    ])
    await expect(canvas.getByRole('button', { name: 'Drag Stop 1' })).toHaveFocus()
  },
}

/** By pointer: drag the first stop's handle below the third. Nothing moves until the drop. */
export const DragByPointer: Story = {
  render: () => <DeliveryRoute />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    // The drag engine loads after the story mounts, and a drag before then does nothing, so
    // drag again until one lands. A drag that lands in the wrong place still fails.
    await waitFor(
      async () => {
        if (places(root)[0] === 'Leeds depot') {
          const third = canvas.getAllByRole('group')[3]?.getBoundingClientRect()
          if (!third) throw new Error('Expected a third stop')
          await pointerDrag(canvas.getByRole('button', { name: 'Drag Stop 1' }), {
            x: third.left + 40,
            y: third.bottom - 4,
          })
        }
        await expect(places(root)).toEqual([
          'York, Fossgate',
          'Hull marina',
          'Leeds depot',
          'Beverley market',
        ])
      },
      { timeout: 5000 },
    )
  },
}

/** Rows of a table drag the same way; the handle sits with the row's other actions. */
export const DragTable: Story = {
  render: () => <DeliveryRoute variant="table" />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    canvas.getByRole('button', { name: 'Drag Stop 1' }).focus()
    await userEvent.keyboard('{Enter}{ArrowDown}{Enter}')
    await waitFor(() =>
      expect(places(root)).toEqual([
        'York, Fossgate',
        'Leeds depot',
        'Hull marina',
        'Beverley market',
      ]),
    )
  },
}

/** Cards stack in one column while they can be dragged, so a drag runs one way. */
export const DragCards: Story = {
  render: () => <DeliveryRoute variant="cards" />,
}

interface Passenger {
  name: string
  age: number | null
  bike: boolean
}

/**
 * - `newItem` is the value a new item starts with (or a function returning one).
 * - `min` and `max` bound the count: at `max`, Add is `aria-disabled` with a reason; at `min`,
 *   Remove is hidden.
 * - `itemLabel` names each item, and `addLabel` names the add button.
 * - `empty` replaces the default empty state.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: { passengers: [{ name: 'Ines Varga', age: 34, bike: true }] as Passenger[] },
    })
    return (
      <Form form={form} aria-label="Passengers">
        <Stack gap={5}>
          <Repeater
            form={form}
            name="passengers"
            label="Passengers"
            newItem={{ name: '', age: null, bike: false }}
            min={1}
            max={6}
            itemLabel={(index) => `Passenger ${String(index + 1)}`}
            addLabel="Add a passenger"
          >
            {(item) => (
              <>
                <item.fields.TextField name="name" label="Name" />
                <item.fields.NumberField name="age" label="Age" min={0} />
                <item.fields.CheckboxField name="bike" label="Bringing a bike" />
              </>
            )}
          </Repeater>
          <SubmitButton>Continue</SubmitButton>
        </Stack>
      </Form>
    )
  },
}

interface Leg {
  from: string
  to: string
  fare: number | null
}

/**
 * `variant="table"` renders each item as a row and each field as a cell, with `columns` giving the
 * headers. Labels stay for assistive technology but aren't shown, and errors render in the cell.
 * `reorderable` adds move up and move down buttons: keyboard first, no dragging.
 *
 * `variant="cards"` puts each item in a card.
 */
export const Table: Story = {
  name: 'As a table',
  tags: ['docs'],
  render: function Table() {
    const form = useAppForm({
      defaultValues: {
        legs: [
          { from: 'Harbour Square', to: 'Kelso Bay', fare: 4.2 },
          { from: 'Kelso Bay', to: 'Marram Point', fare: 2.8 },
        ] as Leg[],
      },
    })
    return (
      <Form form={form} aria-label="Journey legs">
        <Repeater
          form={form}
          name="legs"
          label="Legs"
          variant="table"
          reorderable
          newItem={{ from: '', to: '', fare: null }}
          columns={[{ header: 'From' }, { header: 'To' }, { header: 'Fare', width: 'min' }]}
          addLabel="Add a leg"
        >
          {(item) => (
            <>
              <item.fields.TextField name="from" label="From" />
              <item.fields.TextField name="to" label="To" />
              <item.fields.AmountField name="fare" label="Fare" currency="GBP" locale="en-GB" />
            </>
          )}
        </Repeater>
      </Form>
    )
  },
}

/** The default kit with drag and drop. Create it once, beside your other kit code. */
const formKit = kit.extend({ dragAndDrop })

/**
 * `reorderable="drag"` adds a drag handle to each item, beside its move buttons. Drag it, or
 * focus it and press Space, the arrow keys and Space again; each step is announced, and the
 * item's values, errors and focus go with it.
 *
 * Drag and drop comes from `@mitcsutt/kiln-forms/dnd`, built on `@mitcsutt/kiln-dnd`: install
 * it, give the kit its `dragAndDrop` with `kit.extend`, and import
 * `@mitcsutt/kiln-dnd/styles.css` after kiln-ui's stylesheet. A schema asks for the same with
 * `"reorderable": "drag"`.
 */
export const DragToReorder: Story = {
  name: 'Drag to reorder',
  tags: ['docs'],
  render: function DragToReorder() {
    const form = formKit.useAppForm({
      defaultValues: {
        stops: [
          { place: 'Leeds depot', arrive: '07:30' },
          { place: 'York, Fossgate', arrive: '09:15' },
          { place: 'Hull marina', arrive: '11:00' },
        ],
      },
    })
    return (
      <Form form={form} aria-label="Delivery route">
        <Repeater
          form={form}
          name="stops"
          label="Stops"
          newItem={{ place: '', arrive: '' }}
          itemLabel={(index) => `Stop ${String(index + 1)}`}
          reorderable="drag"
          addLabel="Add stop"
        >
          {(item) => (
            <>
              <item.fields.TextField name="place" label="Place" />
              <item.fields.TextField name="arrive" label="Arrive by" />
            </>
          )}
        </Repeater>
      </Form>
    )
  },
}
