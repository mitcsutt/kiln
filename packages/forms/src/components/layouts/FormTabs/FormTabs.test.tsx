import { useState } from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubmitButton } from '#components/form/SubmitButton'
import { renderForm } from '#test/renderForm'
import { When } from '#components/layouts/When'
import { FormTabs } from './FormTabs'

const required = ({ value }: { value: string }) => (value === '' ? 'Enter a value' : undefined)
const defaults = { name: '', email: '', company: '', city: '' }

describe('FormTabs', () => {
  it('renders a named tablist; inactive panels stay mounted but hidden', () => {
    renderForm(
      (f) => (
        <FormTabs label="Entry">
          <FormTabs.Tab value="you" label="You">
            <f.TextField name="name" label="Full name" />
          </FormTabs.Tab>
          <FormTabs.Tab value="company" label="Company">
            <f.TextField name="company" label="Company name" />
          </FormTabs.Tab>
        </FormTabs>
      ),
      { defaultValues: defaults },
    )
    const list = screen.getByRole('tablist', { name: 'Entry' })
    const tabs = within(list).getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual(['You', 'Company'])
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    const hiddenInput = screen.getByLabelText('Company name')
    expect(hiddenInput.closest('[role="tabpanel"]')).toHaveAttribute('hidden')
    expect(screen.getByLabelText('Full name').closest('[role="tabpanel"]')).not.toHaveAttribute(
      'hidden',
    )
  })

  it('shows visible-error counts in the triggers after submit and reveals + focuses the first invalid field', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <FormTabs label="Entry" defaultValue="you">
            <FormTabs.Tab value="you" label="You">
              <f.TextField name="name" label="Full name" />
            </FormTabs.Tab>
            <FormTabs.Tab value="company" label="Company">
              <f.TextField
                name="company"
                label="Company name"
                validators={{ onDynamic: required }}
              />
              <f.TextField name="city" label="Home city" validators={{ onDynamic: required }} />
            </FormTabs.Tab>
          </FormTabs>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { ...defaults, name: 'Ada' } },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    const company = await screen.findByRole('tab', { name: 'Company 2 errors' })
    expect(screen.getByRole('tab', { name: 'You' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText('Company name')).toHaveFocus())
    expect(company).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Company name').closest('[role="tabpanel"]')).not.toHaveAttribute(
      'hidden',
    )
  })

  it('supports controlled value and onValueChange', async () => {
    const changes: string[] = []
    function Controlled({
      children,
    }: {
      children: (value: string, set: (v: string) => void) => React.ReactNode
    }) {
      const [value, setValue] = useState('company')
      return <>{children(value, setValue)}</>
    }
    const { user } = renderForm(
      (f) => (
        <Controlled>
          {(value, setValue) => (
            <FormTabs
              label="Entry"
              value={value}
              onValueChange={(next) => {
                changes.push(next)
                setValue(next)
              }}
            >
              <FormTabs.Tab value="you" label="You">
                <f.TextField name="name" label="Full name" />
              </FormTabs.Tab>
              <FormTabs.Tab value="company" label="Company">
                <f.TextField name="company" label="Company name" />
              </FormTabs.Tab>
            </FormTabs>
          )}
        </Controlled>
      ),
      { defaultValues: defaults },
    )
    expect(screen.getByRole('tab', { name: 'Company' })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('tab', { name: 'You' }))
    expect(changes).toEqual(['you'])
    expect(screen.getByRole('tab', { name: 'You' })).toHaveAttribute('aria-selected', 'true')
  })

  it('drops a tab wrapped in When while hidden, keeping DOM order when it returns', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.CheckboxField name="hasCompany" label="I work for a company" />
          <FormTabs label="Entry">
            <FormTabs.Tab value="you" label="You">
              <f.TextField name="name" label="Full name" />
            </FormTabs.Tab>
            <When form={f} is={(v) => v.hasCompany}>
              <FormTabs.Tab value="company" label="Company">
                <f.TextField name="company" label="Company name" />
              </FormTabs.Tab>
            </When>
            <FormTabs.Tab value="contact" label="Contact">
              <f.TextField name="email" label="Email" />
            </FormTabs.Tab>
          </FormTabs>
        </>
      ),
      { defaultValues: { ...defaults, hasCompany: false } },
    )
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['You', 'Contact'])
    await user.click(screen.getByLabelText('I work for a company'))
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'You',
      'Company',
      'Contact',
    ])
  })
})
