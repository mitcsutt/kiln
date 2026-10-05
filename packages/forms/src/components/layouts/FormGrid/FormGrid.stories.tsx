import type { Meta, StoryObj } from '@storybook/react-vite'
import { gridFixture, gridSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormGrid, FormGridItem } from './FormGrid'

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
