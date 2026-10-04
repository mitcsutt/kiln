import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  repeaterCardsFixture,
  repeaterCardsSchema,
  repeaterListFixture,
  repeaterListSchema,
  repeaterTableFixture,
  repeaterTableSchema,
} from '#stories/fixtures/collections'
import { StoryForm } from '#stories/_kit'
import { parityStory } from '#stories/parity'
import { Repeater } from './Repeater'

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
    const canvas = within(canvasElement)
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

export const Table: Story = parityStory(
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
