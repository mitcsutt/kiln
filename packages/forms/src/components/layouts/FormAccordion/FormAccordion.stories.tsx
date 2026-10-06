import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Form,
  FormAccordion,
  FormAccordionItem,
  SubmitButton,
  useAppForm,
} from '@mitcsutt/kiln-forms'
import { Stack } from '@mitcsutt/kiln-ui'
import { accordionFixture, accordionSchema } from '#stories/fixtures/disclosure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

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

/**
 * Use it for optional or rarely needed groups. Required fields hidden in a closed item are easy to
 * miss.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: { wheelchair: false, assistance: '', bike: false, dog: false },
    })
    return (
      <Form form={form} aria-label="Travel needs">
        <Stack gap={5}>
          <FormAccordion defaultValue={['access']}>
            <FormAccordionItem
              value="access"
              title="Access"
              description="Ramps, spaces and help boarding"
            >
              <form.CheckboxField name="wheelchair" label="I need a wheelchair space" />
              <form.TextareaField name="assistance" label="Help boarding" optional />
            </FormAccordionItem>
            <FormAccordionItem value="travelling-with" title="Travelling with">
              <form.SwitchField name="bike" label="A bike" />
              <form.SwitchField name="dog" label="A dog" />
            </FormAccordionItem>
          </FormAccordion>
          <SubmitButton>Save needs</SubmitButton>
        </Stack>
      </Form>
    )
  },
}
