import type { Meta, StoryObj } from '@storybook/react-vite'
import { panelsFixture, panelsSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { FormPanels } from './FormPanels'

const meta = {
  title: 'Forms/Layouts/FormPanels',
  component: FormPanels,
  args: { children: null },
} satisfies Meta<typeof FormPanels>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(panelsFixture, panelsSchema, [
  'FormPanels',
  'FormPanels.Panel',
])
