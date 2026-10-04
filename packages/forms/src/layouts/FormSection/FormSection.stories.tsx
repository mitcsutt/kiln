import type { Meta, StoryObj } from '@storybook/react-vite'
import { sectionFixture, sectionSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { FormSection } from './FormSection'

const meta = {
  title: 'Forms/Layouts/FormSection',
  component: FormSection,
  args: { title: 'Recipient', children: null },
} satisfies Meta<typeof FormSection>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(sectionFixture, sectionSchema, ['FormSection'])
