import { act, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormStatus } from '#components/form/FormStatus'
import { getFormRuntime } from '#runtime/formRuntime'
import { renderForm } from '#test/renderForm'

describe('FormStatus', () => {
  it('is a polite status region reporting dirty / saving / saved / error', async () => {
    const { form, user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" />
          <FormStatus />
        </>
      ),
      { defaultValues: { name: '' } },
    )
    const status = screen.getByRole('status')
    expect(status).toBeEmptyDOMElement()
    await user.type(screen.getByLabelText('Name'), 'A')
    expect(status).toHaveTextContent('Unsaved changes')
    const runtime = getFormRuntime(form)
    act(() => {
      runtime.autosave = 'saving'
      runtime.notify()
    })
    expect(status).toHaveTextContent('Saving…')
    act(() => {
      runtime.autosave = 'error'
      runtime.notify()
    })
    expect(status).toHaveTextContent("Couldn't save")
  })

  it('respects show', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" />
          <FormStatus show={['saving']} />
        </>
      ),
      { defaultValues: { name: '' } },
    )
    await user.type(screen.getByLabelText('Name'), 'A')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
