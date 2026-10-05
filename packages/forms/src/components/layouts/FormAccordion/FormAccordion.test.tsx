import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubmitButton } from '#components/form/SubmitButton'
import { renderForm } from '#test/renderForm'
import { FormAccordion } from './FormAccordion'

const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)

describe('FormAccordion', () => {
  it('keeps closed items mounted but hidden, with heading triggers', () => {
    renderForm(
      (f) => (
        <FormAccordion defaultValue="profile">
          <FormAccordion.Item value="profile" title="Profile" headingLevel={2}>
            <f.TextField name="name" label="Full name" />
          </FormAccordion.Item>
          <FormAccordion.Item
            value="billing"
            title="Billing"
            description="Only needed for paid plans."
          >
            <f.TextField name="vat" label="VAT number" />
          </FormAccordion.Item>
        </FormAccordion>
      ),
      { defaultValues: { name: '', vat: '' } },
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Billing' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    const vat = screen.getByLabelText('VAT number')
    expect(vat.closest('[hidden]')).not.toBeNull()
    const fullName = screen.getByLabelText('Full name')
    expect(fullName.closest('[hidden]')).toBeNull()
  })

  it('counts errors in the trigger after submit and opens the closed item to focus its field', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <FormAccordion type="single" defaultValue="profile">
            <FormAccordion.Item value="profile" title="Profile">
              <f.TextField name="name" label="Full name" />
            </FormAccordion.Item>
            <FormAccordion.Item value="billing" title="Billing">
              <f.TextField name="vat" label="VAT number" validators={{ onDynamic: required }} />
            </FormAccordion.Item>
          </FormAccordion>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { name: 'Ada', vat: '' } },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByLabelText('VAT number')).toHaveFocus())
    expect(screen.getByRole('button', { name: 'Billing 1 error' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    // single: the other item closed
    expect(screen.getByRole('button', { name: 'Profile' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await user.type(screen.getByLabelText('VAT number'), 'GB123')
    expect(await screen.findByRole('button', { name: 'Billing' })).toBeInTheDocument()
  })
})
