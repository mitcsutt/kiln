import { useState } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { SubmitButton } from '#components/form/SubmitButton'
import { FieldPresentation } from '#components/fields/FieldPresentation'
import { revealFieldErrors } from '#runtime/reveal'
import { FieldScope } from '#components/layouts/FieldScope'
import { applyServerErrors } from '#runtime/serverErrors'
import { getFormRuntime, toFormApi } from '#runtime/formRuntime'
import { kit } from '#kit/defaultKit'
import { renderForm } from '#test/renderForm'

describe('useFieldBinding', () => {
  it('does not show an error on the first keystroke, only after blur (isTouched is not isBlurred)', async () => {
    const { user } = renderForm(
      (f) => (
        <f.TextField
          name="code"
          label="Code"
          validators={{
            onChange: ({ value }) => (value.length < 4 ? 'Enter 4 characters' : undefined),
          }}
        />
      ),
      { defaultValues: { code: '' } },
    )
    await user.type(screen.getByLabelText('Code'), 'A')
    expect(screen.queryByText('Enter 4 characters')).not.toBeInTheDocument()
    await user.tab()
    expect(await screen.findByText('Enter 4 characters')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Enter 4 characters')
  })

  it("errorVisibility 'change' shows after the first edit", async () => {
    const { user } = renderForm(
      (f) => (
        <f.TextField
          name="code"
          label="Code"
          validators={{
            onChange: ({ value }) => (value.length < 4 ? 'Enter 4 characters' : undefined),
          }}
        />
      ),
      { defaultValues: { code: '' }, errorVisibility: 'change' },
    )
    await user.type(screen.getByLabelText('Code'), 'A')
    expect(await screen.findByText('Enter 4 characters')).toBeInTheDocument()
  })

  it('excluded: editable, not validated (field and form schema), submits the default', async () => {
    const onSubmit = vi.fn()
    // The schema makes the excluded field optional-shaped (its default passes), as the docs advise.
    const schema = z.object({
      name: z.string(),
      vat: z.union([z.literal(''), z.string().min(5, 'Enter a VAT number')]),
    })
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField
            name="vat"
            label="VAT number"
            excluded
            validators={{ onDynamic: () => 'Never shown' }}
          />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { name: 'Ada', vat: '' }, schema, onSubmit },
    )
    const input = screen.getByLabelText('VAT number')
    await user.type(input, 'GB1')
    expect(input).toHaveValue('GB1')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ value: { name: 'Ada', vat: '' } })
    expect(screen.queryByText('Never shown')).not.toBeInTheDocument()
    expect(screen.queryByText('Enter a VAT number')).not.toBeInTheDocument()
  })

  it('disabled/readOnly: submitted as-is, errors cleared when becoming inactive', async () => {
    const onSubmit = vi.fn()
    function Harness({ locked }: { locked: boolean }) {
      const form = kit.useAppForm({ defaultValues: { name: '' }, onSubmit })
      return (
        <form>
          <form.TextField
            name="name"
            label="Name"
            readOnly={locked}
            validators={{ onDynamic: ({ value }) => (value ? undefined : 'Enter a name') }}
          />
        </form>
      )
    }
    const { rerender } = render(<Harness locked={false} />)
    const input = screen.getByLabelText('Name')
    act(() => {
      input.focus()
    })
    act(() => {
      input.blur()
    })
    expect(await screen.findByText('Enter a name')).toBeInTheDocument()
    rerender(<Harness locked />)
    await waitFor(() => expect(screen.queryByText('Enter a name')).not.toBeInTheDocument())
    expect(input).toHaveAttribute('readonly')
  })

  it('a cascaded disabled cannot be overridden by the field', () => {
    renderForm(
      (f) => (
        <FieldPresentation disabled>
          <f.TextField name="name" label="Name" disabled={false} />
        </FieldPresentation>
      ),
      { defaultValues: { name: '' } },
    )
    expect(screen.getByLabelText('Name')).toBeDisabled()
  })

  it('external error placement keeps aria-invalid, hides the message, and links the external id', async () => {
    const { user } = renderForm(
      (f) => (
        <FieldPresentation
          errorPlacement="external"
          describedBy={(name) => `${name}-sentence-error`}
          labelHidden
        >
          <f.TextField
            name="guests"
            label="Guests"
            validators={{ onBlur: () => 'Enter a number' }}
          />
        </FieldPresentation>
      ),
      { defaultValues: { guests: '' } },
    )
    const input = screen.getByLabelText('Guests')
    await user.click(input)
    await user.tab()
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
    expect(screen.queryByText('Enter a number')).not.toBeInTheDocument()
    expect(input.getAttribute('aria-describedby')).toContain('guests-sentence-error')
  })

  it('server errors show on the field and clear on its next change only', async () => {
    const { form, user } = renderForm(
      (f) => (
        <>
          <f.TextField name="email" label="Email" />
          <f.TextField name="handle" label="Handle" />
        </>
      ),
      { defaultValues: { email: 'a@b.co', handle: 'ada' } },
    )
    act(() => {
      applyServerErrors(form, {
        fields: { email: 'That email is taken', handle: 'That handle is taken' },
      })
    })
    act(() => {
      form.setFieldMeta('email', (prev) => ({ ...prev, isBlurred: true }))
      form.setFieldMeta('handle', (prev) => ({ ...prev, isBlurred: true }))
    })
    expect(await screen.findByText('That email is taken')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Email'), 'm')
    await waitFor(() => expect(screen.queryByText('That email is taken')).not.toBeInTheDocument())
    expect(screen.getByText('That handle is taken')).toBeInTheDocument()
  })

  it('resolves $message keys with params and the form formatError', async () => {
    const { user } = renderForm(
      (f) => (
        <f.TextField
          name="pin"
          label="PIN"
          validators={{ onBlur: () => ({ message: '$rules.minLength', params: { value: 4 } }) }}
        />
      ),
      { defaultValues: { pin: '' }, formatError: (e) => `${e.message}.` },
    )
    await user.click(screen.getByLabelText('PIN'))
    await user.tab()
    expect(await screen.findByText('Enter at least 4 characters.')).toBeInTheDocument()
  })

  it('shows validating state from async validators', async () => {
    let resolve: (value: string | undefined) => void = () => undefined
    const { user } = renderForm(
      (f) => (
        <f.TextField
          name="handle"
          label="Handle"
          validators={{ onBlurAsync: () => new Promise<string | undefined>((r) => (resolve = r)) }}
        />
      ),
      { defaultValues: { handle: '' } },
    )
    await user.click(screen.getByLabelText('Handle'))
    await user.tab()
    await waitFor(() =>
      expect(screen.getByLabelText(/Handle/)).toHaveAttribute('aria-busy', 'true'),
    )
    await act(() => {
      resolve('Taken')
      return Promise.resolve()
    })
    expect(await screen.findByText('Taken')).toBeInTheDocument()
  })

  it('dev guard: logs once when the canonical path binds the wrong value type', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    renderForm(
      (f) => <f.AppField name="age">{(field) => <field.TextField label="Age" />}</f.AppField>,
      { defaultValues: { age: 42 } },
    )
    expect(error).toHaveBeenCalledTimes(1)
    expect(String(error.mock.calls[0]?.[0])).toContain('Field "age"')
    error.mockRestore()
  })

  it('registers the field for focus and unregisters on unmount', () => {
    const { form, unmount } = renderForm((f) => <f.TextField name="name" label="Name" />, {
      defaultValues: { name: '' },
    })
    const runtime = getFormRuntime(form)
    expect(runtime.fields.get('name')?.getLabel()).toBe('Name')
    unmount()
    expect(runtime.fields.has('name')).toBe(false)
  })

  it('a view-mode copy registers neither for focus nor in scopes, and its unmount keeps the real entry', () => {
    let reviewNames: readonly string[] = []
    let setShown: (shown: boolean) => void = () => undefined
    function Review({ children }: { children: React.ReactNode }) {
      const [shown, set] = useState(true)
      setShown = set
      if (!shown) return null
      return (
        <FieldScope onNamesChange={(names) => (reviewNames = names)}>
          <FieldPresentation mode="view">{children}</FieldPresentation>
        </FieldScope>
      )
    }
    const { form } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" />
          <Review>
            <f.TextField name="name" label="Name" />
          </Review>
        </>
      ),
      { defaultValues: { name: 'Ada' } },
    )
    const runtime = getFormRuntime(form)
    const entry = runtime.fields.get('name')
    expect(entry?.element()).toBe(screen.getByRole('textbox', { name: 'Name' }))
    expect(reviewNames).toEqual([])
    act(() => {
      setShown(false)
    })
    expect(runtime.fields.get('name')).toBe(entry)
  })

  it('revealFieldErrors shows errors under every visibility policy (a scoped submit attempt)', async () => {
    for (const errorVisibility of ['blur', 'change', 'submit', () => false] as const) {
      const { form, unmount } = renderForm(
        (f) => (
          <f.TextField
            name="name"
            label="Name"
            validators={{ onDynamic: ({ value }) => (value ? undefined : 'Enter a name') }}
          />
        ),
        { defaultValues: { name: '' }, errorVisibility },
      )
      await act(async () => {
        await form.validateField('name', 'submit')
        revealFieldErrors(toFormApi(form), ['name'])
      })
      await waitFor(() =>
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute(
          'aria-invalid',
          'true',
        ),
      )
      expect(screen.getByText('Enter a name')).toBeInTheDocument()
      act(() => {
        form.reset()
      })
      expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveAttribute(
        'aria-invalid',
        'true',
      )
      unmount()
    }
  })

  it('view mode creates no TanStack field instance (Form mode="view")', () => {
    const { form } = renderForm((f) => <f.TextField name="name" label="Name" />, {
      defaultValues: { name: 'Ada' },
      formProps: { mode: 'view' },
    })
    expect(screen.getByText('Ada')).toBeInTheDocument()
    const info = (
      form as unknown as { fieldInfo: Record<string, { instance: unknown } | undefined> }
    ).fieldInfo
    expect(info.name?.instance ?? null).toBeNull()
  })

  it('a view copy re-renders with its value (selector over one path)', () => {
    const { form } = renderForm(
      (f) => (
        <FieldPresentation mode="view">
          <f.TextField name="name" label="Name" />
        </FieldPresentation>
      ),
      { defaultValues: { name: 'Ada', other: '' } },
    )
    act(() => {
      form.setFieldValue('name', 'Grace')
    })
    expect(screen.getByText('Grace')).toBeInTheDocument()
  })
})
