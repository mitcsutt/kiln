import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SubmitButton } from '#components/SubmitButton'
import { renderForm } from '#test/renderForm'

describe('SubmitButton', () => {
  it('is never disabled; requireChanges makes it aria-disabled with a spoken reason', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" />
          <SubmitButton requireChanges>Save changes</SubmitButton>
        </>
      ),
      { defaultValues: { name: 'Ada' }, onSubmit },
    )
    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAccessibleDescription('There are no changes to save')
    await user.click(button)
    expect(onSubmit).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('Name'), ' L')
    expect(button).not.toHaveAttribute('aria-disabled')
    await user.click(button)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('passes submitMeta to onSubmit', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      () => (
        <>
          <SubmitButton submitMeta={{ action: 'draft' }}>Save draft</SubmitButton>
          <SubmitButton>Publish</SubmitButton>
        </>
      ),
      { defaultValues: { title: 'Release notes' }, onSubmitMeta: { action: 'publish' }, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Save draft' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({ meta: { action: 'draft' } }),
      )
    })
    await user.click(screen.getByRole('button', { name: 'Publish' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({ meta: { action: 'publish' } }),
      )
    })
  })

  it('defaults its text to messages.submit', () => {
    renderForm(() => <SubmitButton />, { defaultValues: {}, messages: { submit: 'Send it' } })
    expect(screen.getByRole('button', { name: 'Send it' })).toBeInTheDocument()
  })
})
