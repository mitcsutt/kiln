import { act, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ErrorSummary } from '#components/form/ErrorSummary'
import { SubmitButton } from '#components/form/SubmitButton'
import { FormSubmitError } from '#runtime/serverErrors'
import { getFormRuntime } from '#runtime/formRuntime'
import { renderForm } from '#test/renderForm'

const required = ({ value }: { value: string }) =>
  value.trim() === '' ? 'Enter your name' : undefined

describe('Form submit pipeline (§5.5)', () => {
  it('submits pruned values + schema output, then rebaselines (clean, values kept)', async () => {
    const onSubmit = vi.fn()
    const schema = z.object({ name: z.string().transform((s) => s.trim()), seats: z.number() })
    const { form, user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" />
          <SubmitButton>Book</SubmitButton>
        </>
      ),
      { defaultValues: { name: '', seats: 2 }, schema, onSubmit },
    )
    await user.type(screen.getByLabelText('Name'), '  Ada ')
    expect(form.state.isDefaultValue).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Book' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    const ctx = onSubmit.mock.calls[0]?.[0] as { value: unknown; output: unknown }
    expect(ctx.value).toEqual({ name: '  Ada ', seats: 2 })
    expect(ctx.output).toEqual({ name: 'Ada', seats: 2 })
    await waitFor(() => {
      expect(form.state.isSubmitSuccessful).toBe(true)
    })
    expect(form.state.values.name).toBe('  Ada ')
    expect(form.state.isDefaultValue).toBe(true)
  })

  it('maps FormSubmitError to fields and the form; field errors clear on edit', async () => {
    const onSubmit = vi.fn(() =>
      Promise.reject(
        new FormSubmitError<{ email: string }>({
          form: 'We could not create your account',
          fields: { email: 'That email is taken' },
        }),
      ),
    )
    const { form, user } = renderForm(
      (f) => (
        <>
          <ErrorSummary />
          <f.TextField name="email" label="Email" />
          <SubmitButton>Create account</SubmitButton>
        </>
      ),
      { defaultValues: { email: 'ada@example.com' }, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Email: That email is taken')).toBeInTheDocument()
    expect(screen.getByText('We could not create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(form.state.isSubmitSuccessful).toBe(false)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus())
    await user.type(screen.getByLabelText('Email'), 'm')
    await waitFor(() => expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid'))
  })

  it('a generic throw never rejects: shows submitFailed, logs, and allows resubmit', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    let attempts = 0
    const onSubmit = vi.fn(() => {
      attempts += 1
      return attempts === 1 ? Promise.reject(new Error('Network down')) : Promise.resolve()
    })
    const { form, user } = renderForm(
      () => (
        <>
          <ErrorSummary />
          <SubmitButton>Send</SubmitButton>
        </>
      ),
      { defaultValues: { note: 'hi' }, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(
      await screen.findByText("Something went wrong and we couldn't send this. Try again."),
    ).toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Network down' }))
    expect(form.state.isSubmitSuccessful).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(2)
    })
    await waitFor(() => {
      expect(form.state.isSubmitSuccessful).toBe(true)
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(unhandled).not.toHaveBeenCalled()
    process.off('unhandledRejection', unhandled)
    consoleError.mockRestore()
  })

  it('calls onSubmitError instead of the default for non-FormSubmitError throws', async () => {
    const onSubmitError = vi.fn()
    const { user } = renderForm(() => <SubmitButton>Send</SubmitButton>, {
      defaultValues: { note: '' },
      onSubmit: () => {
        throw new Error('Boom')
      },
      onSubmitError,
    })
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => {
      expect(onSubmitError).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) as unknown }),
      )
    })
  })

  it('ignores a second submit while the first is in flight', async () => {
    let finish: () => void = () => undefined
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    const { user, container } = renderForm(() => <SubmitButton>Pay</SubmitButton>, {
      defaultValues: { amount: 10 },
      onSubmit,
    })
    const button = screen.getByRole('button', { name: 'Pay' })
    await user.click(button)
    await waitFor(() =>
      expect(container.querySelector('form')).toHaveAttribute('aria-busy', 'true'),
    )
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toBeDisabled()
    await user.click(button)
    act(() => {
      container.querySelector('form')?.requestSubmit()
    })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await act(() => {
      finish()
      return Promise.resolve()
    })
    await waitFor(() => expect(button).not.toHaveAttribute('aria-disabled'))
  })

  it("afterSubmit 'lock' keeps the button aria-disabled until reset", async () => {
    const onSubmit = vi.fn()
    const { form, user } = renderForm(() => <SubmitButton>Save</SubmitButton>, {
      defaultValues: { name: 'Ada' },
      onSubmit,
      afterSubmit: 'lock',
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-disabled', 'true'),
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    act(() => {
      form.reset()
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-disabled'),
    )
    expect(getFormRuntime(form).locked).toBe(false)
  })

  it("afterSubmit 'reset' returns to the original defaults", async () => {
    const { form, user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { name: '' }, onSubmit: () => undefined, afterSubmit: 'reset' },
    )
    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(form.state.values.name).toBe('')
    })
  })

  it('shows every error on the first submit (form schema and field validators together)', async () => {
    const schema = z.object({ name: z.string(), email: z.string().min(1, 'Enter your email') })
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" validators={{ onDynamic: required }} />
          <f.TextField name="email" label="Email" />
          <SubmitButton>Join</SubmitButton>
        </>
      ),
      { defaultValues: { name: '', email: '' }, schema },
    )
    await user.click(screen.getByRole('button', { name: 'Join' }))
    expect(await screen.findByText('Enter your name')).toBeInTheDocument()
    expect(await screen.findByText('Enter your email')).toBeInTheDocument()
  })

  it('submits from an external button through formId', async () => {
    const onSubmit = vi.fn()
    const { form } = renderForm(() => null, {
      defaultValues: { name: 'Ada' },
      onSubmit,
      formProps: { id: 'booking' },
    })
    await import('@testing-library/react').then(({ render }) =>
      render(
        <SubmitButton form={form} formId="booking">
          Book now
        </SubmitButton>,
      ),
    )
    screen.getByRole('button', { name: 'Book now' }).click()
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('Form disabled / readOnly / mode cascade to fields', () => {
    renderForm((f) => <f.TextField name="name" label="Name" />, {
      defaultValues: { name: 'Ada' },
      formProps: { disabled: true },
    })
    expect(screen.getByLabelText('Name')).toBeDisabled()
  })

  it('stops when the submit-time parse fails only on inactive paths: form error, dev warning, no onSubmit', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const onSubmit = vi.fn()
    const schema = z.object({ name: z.string(), vat: z.string().min(5, 'Enter a VAT number') })
    const { user, form } = renderForm(
      (f) => (
        <>
          <ErrorSummary />
          <f.TextField name="name" label="Name" />
          <f.TextField name="vat" label="VAT number" excluded />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { name: 'Ada', vat: '' }, schema, onSubmit },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      await screen.findByText("Something went wrong and we couldn't send this. Try again."),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(form.state.isSubmitSuccessful).toBe(false)
    expect(screen.queryByText('Enter a VAT number')).not.toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('vat'))
    expect(String(warn.mock.calls[0]?.[0])).toContain('optional in the schema')
    warn.mockRestore()
  })

  it('a schema whose validate throws is handled like any other failure (no unhandled rejection)', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    const onSubmit = vi.fn()
    // Armed by the form's onSubmit validator; the submit-time onDynamic run then passes and the
    // pipeline's re-parse (the next call) throws.
    let callsUntilThrow = Number.POSITIVE_INFINITY
    const schema = {
      '~standard': {
        version: 1 as const,
        vendor: 'test',
        validate: (value: unknown) => {
          callsUntilThrow -= 1
          if (callsUntilThrow <= 0) throw new Error('Schema exploded')
          return { value: value as { name: string } }
        },
      },
    }
    const { user, form } = renderForm(
      () => (
        <>
          <ErrorSummary />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      {
        defaultValues: { name: 'Ada' },
        schema,
        onSubmit,
        validators: {
          onSubmit: () => {
            // Field/form validation has passed by now; the pipeline's re-parse is next.
            callsUntilThrow = 2
            return undefined
          },
        },
      },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      await screen.findByText("Something went wrong and we couldn't send this. Try again."),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Schema exploded' }),
    )
    expect(form.state.isSubmitSuccessful).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(unhandled).not.toHaveBeenCalled()
    process.off('unhandledRejection', unhandled)
    consoleError.mockRestore()
  })
})
