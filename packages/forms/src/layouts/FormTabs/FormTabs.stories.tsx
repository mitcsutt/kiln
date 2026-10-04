import type { Meta, StoryObj } from '@storybook/react-vite'
import { tabsFixture, tabsSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { FormTabs } from './FormTabs'

const meta = {
  title: 'Forms/Layouts/FormTabs',
  component: FormTabs,
  args: { label: 'Workspace settings', children: null },
} satisfies Meta<typeof FormTabs>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(tabsFixture, tabsSchema, [
  'FormTabs',
  'FormTabs.Tab',
])
