import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResetButton } from '#components/ResetButton'
import { SubmitButton } from '#components/SubmitButton'
import { renderForm } from '#test/renderForm'
import { FormActions } from './FormActions'

describe('FormActions', () => {
  it('lays out the action row', () => {
    renderForm(
      () => (
        <FormActions>
          <ResetButton>Discard</ResetButton>
          <SubmitButton>Save</SubmitButton>
        </FormActions>
      ),
      { defaultValues: { name: '' } },
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument()
  })

  it('status renders FormStatus at the start', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" />
          <FormActions status>
            <SubmitButton>Save</SubmitButton>
          </FormActions>
        </>
      ),
      { defaultValues: { name: '' } },
    )
    await user.type(screen.getByLabelText('Name'), 'Ada')
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved changes')
  })
})
