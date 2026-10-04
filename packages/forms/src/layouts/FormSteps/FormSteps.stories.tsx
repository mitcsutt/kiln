import type { Meta, StoryObj } from '@storybook/react-vite'
import { stepsFixture, stepsSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { FormSteps } from './FormSteps'

const meta = {
  title: 'Forms/Layouts/FormSteps',
  component: FormSteps,
  args: { label: 'Sign up', children: null },
} satisfies Meta<typeof FormSteps>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(stepsFixture, stepsSchema, [
  'FormSteps',
  'FormSteps.Step',
])
