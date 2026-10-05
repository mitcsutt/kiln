import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderForm } from '#test/renderForm'
import { FormSection } from './FormSection'

const defaults = { name: '', email: '' }

describe('FormSection', () => {
  it('is a fieldset named by its legend by default', () => {
    renderForm(
      (f) => (
        <FormSection title="Your details" description="We only use these to send your receipt.">
          <f.TextField name="name" label="Full name" />
        </FormSection>
      ),
      { defaultValues: defaults },
    )
    const group = screen.getByRole('group', { name: 'Your details' })
    expect(group.tagName).toBe('FIELDSET')
    expect(group.querySelector('legend')).toHaveTextContent('Your details')
    expect(screen.getByText('We only use these to send your receipt.')).toBeInTheDocument()
  })

  it('as="section" renders a section labelled by a heading at headingLevel', () => {
    renderForm(
      (f) => (
        <FormSection as="section" title="Payment" headingLevel={2}>
          <f.TextField name="name" label="Name on card" />
        </FormSection>
      ),
      { defaultValues: defaults },
    )
    const region = screen.getByRole('region', { name: 'Payment' })
    expect(region.tagName).toBe('SECTION')
    expect(screen.getByRole('heading', { level: 2, name: 'Payment' })).toBeInTheDocument()
  })

  it('keeps a hidden title for assistive tech', () => {
    renderForm(
      (f) => (
        <FormSection title="Contact" titleHidden>
          <f.TextField name="email" label="Email" />
        </FormSection>
      ),
      { defaultValues: defaults },
    )
    expect(screen.getByRole('group', { name: 'Contact' })).toBeInTheDocument()
  })

  it('cascades disabled (native fieldset) and readOnly to the fields inside', () => {
    renderForm(
      (f) => (
        <>
          <FormSection title="Locked" disabled>
            <f.TextField name="name" label="Full name" />
          </FormSection>
          <FormSection as="section" title="Read only" readOnly>
            <f.TextField name="email" label="Email" readOnly={false} />
          </FormSection>
        </>
      ),
      { defaultValues: defaults },
    )
    expect(screen.getByLabelText('Full name')).toBeDisabled()
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly')
  })
})
