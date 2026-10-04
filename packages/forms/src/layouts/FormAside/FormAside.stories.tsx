import type { Meta, StoryObj } from '@storybook/react-vite'
import { asideFixture, asideSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { FormAside } from './FormAside'

const meta = {
  title: 'Forms/Layouts/FormAside',
  component: FormAside,
  args: { title: 'Public profile', children: null },
} satisfies Meta<typeof FormAside>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(asideFixture, asideSchema, ['FormAside'])
