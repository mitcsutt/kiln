import type { Meta, StoryObj } from '@storybook/react-vite'
import { panelsFixture, panelsSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormPanel, FormPanels } from './FormPanels'

const meta = {
  title: 'Forms/Layouts/FormPanels',
  component: FormPanels,
  args: { columns: { base: 1, md: 2 }, gap: 5, children: null },
} satisfies Meta<typeof FormPanels>

export default meta
type Story = StoryObj<typeof meta>

/** A payment method split into panels. Try `columns` and `gap`. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Payment method" defaultValues={{ cardholder: '', billingPostcode: '' }}>
      {(form) => (
        <FormPanels {...args}>
          <FormPanel title="Card">
            <form.TextField name="cardholder" label="Name on card" />
          </FormPanel>
          <FormPanel title="Billing address" description="Must match the address your bank has.">
            <form.TextField name="billingPostcode" label="Postcode" />
          </FormPanel>
        </FormPanels>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(panelsFixture, panelsSchema, [
  'FormPanels',
  'FormPanels.Panel',
])
