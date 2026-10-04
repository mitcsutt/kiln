import type { Meta, StoryObj } from '@storybook/react-vite'
import { rowsFixture, rowsSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { FormRows } from './FormRows'

const meta = {
  title: 'Forms/Layouts/FormRows',
  component: FormRows,
  args: { children: null },
} satisfies Meta<typeof FormRows>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(rowsFixture, rowsSchema, ['FormRows'])
