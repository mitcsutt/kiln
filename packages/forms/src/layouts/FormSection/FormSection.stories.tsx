import type { Meta, StoryObj } from '@storybook/react-vite'
import { sectionFixture, sectionSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormSection } from './FormSection'

const meta = {
  title: 'Forms/Layouts/FormSection',
  component: FormSection,
  args: {
    title: 'Recipient',
    description: 'Who should sign for the parcel.',
    as: 'fieldset',
    titleHidden: false,
    disabled: false,
    readOnly: false,
    children: null,
  },
} satisfies Meta<typeof FormSection>

export default meta
type Story = StoryObj<typeof meta>

/** A titled group of fields. Try `as`, `titleHidden`, `disabled` and `readOnly`. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Delivery" defaultValues={{ recipient: '', phone: '' }}>
      {(form) => (
        <FormSection {...args}>
          <form.TextField name="recipient" label="Name" />
          <form.TextField name="phone" label="Phone number" type="tel" />
        </FormSection>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(sectionFixture, sectionSchema, ['FormSection'])
