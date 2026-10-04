import type { Meta, StoryObj } from '@storybook/react-vite'
import { gridFixture, gridSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { FormGrid } from './FormGrid'

const meta = {
  title: 'Forms/Layouts/FormGrid',
  component: FormGrid,
  args: { children: null },
} satisfies Meta<typeof FormGrid>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(gridFixture, gridSchema, [
  'FormGrid',
  'FormGrid.Item',
])
