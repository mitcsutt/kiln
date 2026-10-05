import type { Meta, StoryObj } from '@storybook/react-vite'
import { accordionFixture, accordionSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormAccordion, FormAccordionItem } from './FormAccordion'

const meta = {
  title: 'Forms/Layouts/FormAccordion',
  component: FormAccordion,
  args: { type: 'multiple', defaultValue: ['when'], variant: 'divided', children: null },
} satisfies Meta<typeof FormAccordion>

export default meta
type Story = StoryObj<typeof meta>

/** A home visit booking in two panels. Try `type`, `defaultValue` and `variant`. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Home visit" defaultValues={{ visitDate: '', address: '', notes: '' }}>
      {(form) => (
        <FormAccordion {...args}>
          <FormAccordionItem value="when" title="When">
            <form.DateField name="visitDate" label="Visit date" />
          </FormAccordionItem>
          <FormAccordionItem
            value="where"
            title="Where"
            description="Address and any access notes."
          >
            <form.TextField name="address" label="Address" />
            <form.TextareaField name="notes" label="Access notes" />
          </FormAccordionItem>
        </FormAccordion>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(accordionFixture, accordionSchema, [
  'FormAccordion',
  'FormAccordion.Item',
])
