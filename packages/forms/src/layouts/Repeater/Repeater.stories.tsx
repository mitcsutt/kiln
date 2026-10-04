import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  repeaterCardsFixture,
  repeaterCardsSchema,
  repeaterListFixture,
  repeaterListSchema,
  repeaterTableFixture,
  repeaterTableSchema,
} from '#stories/fixtures/collections'
import { parityStory } from '#stories/parity'

// `Repeater` is generic over the form and the array path, so the meta names no `component`.
const meta = {
  title: 'Forms/Layouts/Repeater',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

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
