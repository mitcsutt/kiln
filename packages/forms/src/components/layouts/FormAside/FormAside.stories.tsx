import type { Meta, StoryObj } from '@storybook/react-vite'
import { asideFixture, asideSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormAside } from './FormAside'

const meta = {
  title: 'Forms/Layouts/FormAside',
  component: FormAside,
  args: {
    title: 'Public profile',
    description: 'Other members of your team see this next to your comments.',
    ratio: '4/8',
    collapseBelow: 'md',
    children: null,
  },
} satisfies Meta<typeof FormAside>

export default meta
type Story = StoryObj<typeof meta>

/** A settings group with its explanation beside it. Try `ratio` and `collapseBelow`. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Profile settings" defaultValues={{ displayName: '', bio: '' }}>
      {(form) => (
        <FormAside {...args}>
          <form.TextField name="displayName" label="Display name" />
          <form.TextareaField name="bio" label="Bio" description="A line or two about you." />
        </FormAside>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(asideFixture, asideSchema, ['FormAside'])
