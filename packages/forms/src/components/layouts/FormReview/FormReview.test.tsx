import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FieldViewList } from '#components/fields/FieldView'
import { expectNoAxeViolations } from '#test/a11y'
import { renderForm } from '#test/renderForm'
import { FormGrid } from '#components/layouts/FormGrid'
import { FormRows } from '#components/layouts/FormRows'
import { FormSection } from '#components/layouts/FormSection'
import { FormTabs } from '#components/layouts/FormTabs'
import { FormReview } from './FormReview'

const options = [
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ie', label: 'Ireland' },
]

describe('FormReview', () => {
  it('renders the same field JSX as a description list of label → value', () => {
    renderForm(
      (f) => (
        <FormReview title="Check your answers">
          <f.TextField name="name" label="Full name" />
          <f.SelectField name="country" label="Country" options={options} />
          <f.TextField name="notes" label="Notes" />
        </FormReview>
      ),
      { defaultValues: { name: 'Ada Lovelace', country: 'ie', notes: '' } },
    )
    expect(screen.getByRole('heading', { name: 'Check your answers' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).toBeNull()
    const terms = screen.getAllByRole('term').map((term) => term.textContent)
    expect(terms).toEqual(['Full name', 'Country', 'Notes'])
    const values = screen.getAllByRole('definition').map((value) => value.textContent)
    expect(values).toEqual(['Ada Lovelace', 'Ireland', 'Not provided'])
    for (const item of screen.getAllByRole('term')) expect(item.closest('dl')).not.toBeNull()
  })

  it('an Edit button calls onEdit with the step', async () => {
    const onEdit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <FormReview title="Your details" step="you" onEdit={onEdit} editLabel="Change your details">
          <f.TextField name="name" label="Full name" />
        </FormReview>
      ),
      { defaultValues: { name: 'Ada' } },
    )
    await user.click(screen.getByRole('button', { name: 'Change your details' }))
    expect(onEdit).toHaveBeenCalledWith('you')
  })

  it('the Edit button defaults to messages.edit and is described by the title', async () => {
    const onEdit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <FormReview title="Your details" step="you" onEdit={onEdit}>
          <f.TextField name="name" label="Full name" />
        </FormReview>
      ),
      { defaultValues: { name: 'Ada' }, messages: { edit: 'Change' } },
    )
    const edit = screen.getByRole('button', { name: 'Change' })
    expect(edit).toHaveAccessibleDescription('Your details')
    await user.click(edit)
    expect(onEdit).toHaveBeenCalledWith('you')
  })

  it('renders no Edit button without an action', () => {
    renderForm(
      (f) => (
        <FormReview title="Your details" step="you">
          <f.TextField name="name" label="Full name" />
        </FormReview>
      ),
      { defaultValues: { name: 'Ada' } },
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('stays valid list markup with layouts inside (FormReview containing a FormSection)', async () => {
    const { container } = renderForm(
      (f) => (
        <FormReview title="Check your answers">
          <FormSection title="Your details">
            <f.TextField name="name" label="Full name" />
          </FormSection>
          <f.SelectField name="country" label="Country" options={options} />
        </FormReview>
      ),
      { defaultValues: { name: 'Ada Lovelace', country: 'gb', notes: '' } },
    )
    expectValidViewMarkup(container)
    expect(screen.getByRole('group', { name: 'Your details' })).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })

  it('Form mode="view" with layouts renders valid list markup and no controls', async () => {
    const { container } = renderForm(
      (f) => (
        <>
          <FormSection as="section" title="Profile">
            <FormGrid>
              <f.TextField name="name" label="Full name" />
              <f.SelectField name="country" label="Country" options={options} />
            </FormGrid>
          </FormSection>
          <FormRows>
            <f.TextField name="notes" label="Notes" />
          </FormRows>
          <FormTabs label="More">
            <FormTabs.Tab value="a" label="Extra">
              <f.TextField name="extra" label="Extra" />
            </FormTabs.Tab>
          </FormTabs>
        </>
      ),
      {
        defaultValues: { name: 'Ada', country: 'ie', notes: '', extra: 'x' },
        formProps: { mode: 'view' },
      },
    )
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
      'Full name',
      'Country',
      'Notes',
      'Extra',
    ])
    expectValidViewMarkup(container)
    await expectNoAxeViolations(container)
  })

  it('FieldViewList groups a run of fields into one list', () => {
    const { container } = renderForm(
      (f) => (
        <FormReview>
          <FieldViewList>
            <f.TextField name="name" label="Full name" />
            <f.TextField name="notes" label="Notes" />
          </FieldViewList>
        </FormReview>
      ),
      { defaultValues: { name: 'Ada', country: 'gb', notes: 'Vegan' } },
    )
    expect(container.querySelectorAll('dl')).toHaveLength(1)
    expectValidViewMarkup(container)
  })

  it('layouts inside a FieldViewList reset it: their fields render their own lists', () => {
    const { container } = renderForm(
      (f) => (
        <FieldViewList>
          <f.TextField name="name" label="Full name" />
          <FormSection title="More">
            <f.TextField name="notes" label="Notes" />
          </FormSection>
          <FormGrid>
            <f.SelectField name="country" label="Country" options={options} />
          </FormGrid>
          <FormReview title="Nested review">
            <f.TextField name="name" label="Name again" />
          </FormReview>
        </FieldViewList>
      ),
      {
        defaultValues: { name: 'Ada', country: 'gb', notes: 'Vegan' },
        formProps: { mode: 'view' },
      },
    )
    // every dt/dd's nearest list-or-chrome ancestor is a dl (never a fieldset/section between)
    for (const item of container.querySelectorAll('dt, dd')) {
      expect(item.parentElement?.closest('dl, fieldset, section')?.tagName).toBe('DL')
    }
    const notes = screen.getByText('Vegan').closest('dl')
    expect(notes?.closest('fieldset')).toBe(screen.getByRole('group', { name: 'More' }))
  })
})

/** No dt/dd outside a dl, no nested dl, and no fieldset/section/form chrome inside a dl. */
function expectValidViewMarkup(container: HTMLElement) {
  for (const item of container.querySelectorAll('dt, dd')) expect(item.closest('dl')).not.toBeNull()
  for (const list of container.querySelectorAll('dl')) {
    expect(list.querySelector('dl, fieldset, section, input, select, textarea')).toBeNull()
  }
}
