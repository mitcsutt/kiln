import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, FormPanel, FormPanels, useAppForm } from '@mitcsutt/kiln-forms'
import { Button } from '@mitcsutt/kiln-ui'
import { panelsFixture, panelsSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'

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

/**
 * `actions` puts buttons in a panel's header.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({
      defaultValues: {
        home: { label: 'Home', stop: 'Harbour Square' },
        work: { label: 'Work', stop: 'Northpoint Library' },
      },
    })
    return (
      <Form form={form} aria-label="Saved places">
        <FormPanels columns={{ base: 1, md: 2 }}>
          <FormPanel title="Home" description="Your usual starting point">
            <form.TextField name="home.stop" label="Nearest stop" />
          </FormPanel>
          <FormPanel
            title="Work"
            actions={
              <Button size="sm" variant="ghost" tone="critical">
                Remove
              </Button>
            }
          >
            <form.TextField name="work.stop" label="Nearest stop" />
          </FormPanel>
        </FormPanels>
      </Form>
    )
  },
}
