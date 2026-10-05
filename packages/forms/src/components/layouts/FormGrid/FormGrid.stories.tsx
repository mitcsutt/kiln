import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormGrid, FormGridItem, useAppForm } from '@mitcsutt/kiln-forms'
import { gridFixture, gridSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

const meta = {
  title: 'Forms/Layouts/FormGrid',
  component: FormGrid,
  args: { columns: { base: 1, md: 2 }, gap: 5, children: null },
} satisfies Meta<typeof FormGrid>

export default meta
type Story = StoryObj<typeof meta>

/** A billing address on a grid. Try `columns` and `gap`. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Billing address" defaultValues={{ line1: '', city: '', postcode: '' }}>
      {(form) => (
        <FormGrid {...args}>
          <FormGridItem span={{ base: 1, md: 2 }}>
            <form.TextField name="line1" label="Address line 1" />
          </FormGridItem>
          <form.TextField name="city" label="Town or city" />
          <form.TextField name="postcode" label="Postcode" autoComplete="postal-code" />
        </FormGrid>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(gridFixture, gridSchema, [
  'FormGrid',
  'FormGrid.Item',
])

/**
 * Keep related fields together and in reading order: a grid row is read left to right, then down.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: { street: '', town: '', postcode: '', country: 'GB' },
    })
    return (
      <Form form={form} aria-label="Delivery address">
        <FormGrid columns={{ base: 1, md: 3 }}>
          <FormGridItem span={{ base: 1, md: 3 }}>
            <form.TextField name="street" label="Street" autoComplete="address-line1" />
          </FormGridItem>
          <FormGridItem span={{ base: 1, md: 2 }}>
            <form.TextField name="town" label="Town" autoComplete="address-level2" />
          </FormGridItem>
          <form.TextField name="postcode" label="Postcode" autoComplete="postal-code" />
          <form.SelectField
            name="country"
            label="Country"
            options={[
              { value: 'GB', label: 'United Kingdom' },
              { value: 'IE', label: 'Ireland' },
            ]}
          />
        </FormGrid>
      </Form>
    )
  },
}
