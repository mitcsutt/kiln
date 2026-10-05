import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormSection, useAppForm } from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'
import { sectionFixture, sectionSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

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

/**
 * `disabled` and `readOnly` cascade to every field inside. `title` is required: a fieldset without
 * a legend isn't a section, so use a `Stack` for plain grouping. `titleHidden` keeps the title for
 * screen readers only.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: {
        name: 'Ines Varga',
        email: 'ines@example.com',
        card: '4417',
        expiry: '09/28',
      },
    })
    return (
      <Form form={form} aria-label="Account">
        <Stack gap={7}>
          <FormSection title="Contact details" description="Where we send tickets and receipts.">
            <form.TextField name="name" label="Full name" />
            <form.TextField name="email" label="Email" type="email" />
          </FormSection>
          <FormSection
            title="Saved card"
            description="Managed by your bank. Contact them to change it."
            readOnly
          >
            <form.TextField name="card" label="Card ending" />
            <form.TextField name="expiry" label="Expires" />
          </FormSection>
        </Stack>
      </Form>
    )
  },
}
