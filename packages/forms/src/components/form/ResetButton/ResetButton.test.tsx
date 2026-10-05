import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResetButton } from '#components/form/ResetButton'
import { SubmitButton } from '#components/form/SubmitButton'
import { renderForm } from '#test/renderForm'

describe('ResetButton', () => {
  it("'baseline' undoes edits since the last save; 'defaults' goes back to the original defaults", async () => {
    const { form, user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" />
          <SubmitButton>Save</SubmitButton>
          <ResetButton>Cancel</ResetButton>
          <ResetButton to="defaults">Start over</ResetButton>
        </>
      ),
      { defaultValues: { name: '' }, onSubmit: () => undefined },
    )
    const input = screen.getByLabelText('Name')
    await user.type(input, 'Ada')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(form.state.isSubmitSuccessful).toBe(true)
    })
    await user.type(input, ' L')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(input).toHaveValue('Ada')
    await user.click(screen.getByRole('button', { name: 'Start over' }))
    expect(input).toHaveValue('')
  })

  it('is quiet by default and type="reset"', () => {
    renderForm(() => <ResetButton>Cancel</ResetButton>, { defaultValues: {} })
    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button).toHaveAttribute('type', 'reset')
    expect(button).toHaveAttribute('data-variant', 'ghost')
    expect(button).toHaveAttribute('data-tone', 'neutral')
  })

  it('defaults its text to messages.reset (overridable per form)', () => {
    const { unmount } = renderForm(() => <ResetButton />, { defaultValues: {} })
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    unmount()
    renderForm(() => <ResetButton />, { defaultValues: {}, messages: { reset: 'Clear' } })
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })
})
