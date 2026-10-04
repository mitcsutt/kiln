import type { Meta, StoryObj } from '@storybook/react-vite'
import { accordionFixture, accordionSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { FormAccordion } from './FormAccordion'

const meta = {
  title: 'Forms/Layouts/FormAccordion',
  component: FormAccordion,
  args: { children: null },
} satisfies Meta<typeof FormAccordion>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(accordionFixture, accordionSchema, [
  'FormAccordion',
  'FormAccordion.Item',
])
