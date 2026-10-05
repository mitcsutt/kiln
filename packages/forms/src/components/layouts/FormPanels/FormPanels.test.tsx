import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@mitcsutt/kiln-ui'
import { renderForm } from '#test/renderForm'
import { FormPanels } from './FormPanels'

describe('FormPanels', () => {
  it('renders each panel as a section labelled by its title, with actions beside it', () => {
    renderForm(
      (f) => (
        <FormPanels columns={{ base: 1, md: 2 }}>
          <FormPanels.Panel title="Billing address" description="As it appears on your statement.">
            <f.TextField name="billing" label="Street" />
          </FormPanels.Panel>
          <FormPanels.Panel
            title="Delivery address"
            headingLevel={4}
            actions={<Button size="sm">Copy billing</Button>}
          >
            <f.TextField name="delivery" label="Delivery street" />
          </FormPanels.Panel>
        </FormPanels>
      ),
      { defaultValues: { billing: '', delivery: '' } },
    )
    const billing = screen.getByRole('region', { name: 'Billing address' })
    expect(billing).toContainElement(screen.getByLabelText('Street'))
    expect(screen.getByText('As it appears on your statement.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Delivery address' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy billing' })).toBeInTheDocument()
  })
})
