import type { Meta, StoryObj } from '@storybook/react-vite'
import { actionsFixture, actionsSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { FormActions } from './FormActions'

const meta = {
  title: 'Forms/Layouts/FormActions',
  component: FormActions,
  args: { children: null },
} satisfies Meta<typeof FormActions>

export default meta
type Story = StoryObj<typeof meta>

export const ComponentAndSchema: Story = parityStory(actionsFixture, actionsSchema, [
  'FormActions',
  'ResetButton',
  'SubmitButton',
])
