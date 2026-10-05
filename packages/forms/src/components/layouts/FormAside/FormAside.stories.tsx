import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormAside, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'
import { asideFixture, asideSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

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

/**
 * The fields are a group labelled by the heading. `ratio` is `4/8` (the default), `5/7` or `1/3`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { name: 'Ines Varga', bio: '', alerts: true } })
    return (
      <Form form={form} aria-label="Profile">
        <Stack gap={8} dividers>
          <FormAside title="Profile" description="Shown to people you share routes with.">
            <form.TextField name="name" label="Display name" />
            <form.TextareaField name="bio" label="About you" optional />
          </FormAside>
          <FormAside title="Alerts" description="Email only. Nothing is sent to your phone.">
            <form.SwitchField name="alerts" label="Delays on saved routes" />
          </FormAside>
        </Stack>
      </Form>
    )
  },
}
