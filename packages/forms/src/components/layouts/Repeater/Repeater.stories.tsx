import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, Repeater, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import {
  repeaterCardsFixture,
  repeaterCardsSchema,
  repeaterListFixture,
  repeaterListSchema,
  repeaterTableFixture,
  repeaterTableSchema,
} from '#stories/fixtures/collections'
import { StoryForm, storyRoot } from '#stories/_kit'
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
