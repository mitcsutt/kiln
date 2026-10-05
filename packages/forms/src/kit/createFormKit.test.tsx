import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Form } from '#components/form/Form'
import { useFieldBinding, accepts } from '#hooks/useFieldBinding'
import { defineField } from '#kit/contracts'
import { createFormKit } from '#kit/createFormKit'
import { bindFields } from '#kit/bindFields'
import { kit, useFields } from '#kit/defaultKit'
import { FormTextField } from '#components/fields/FormTextField'
import { renderForm } from '#test/renderForm'

const RatingStub = defineField<number>()(function RatingStub({ label }: { label: string }) {
  const b = useFieldBinding<number | null>({ accepts: accepts.numberOrNull, empty: 0 })
  return (
    <button
      type="button"
      id={b.id}
      aria-label={label}
      onClick={() => {
        b.setValue((b.value ?? 0) + 1)
      }}
    >
      {b.value}
    </button>
  )
})

describe('createFormKit', () => {
  it('exposes field.X (canonical) and form.X (shorthand) from one registry', async () => {
    const { user, form } = renderForm(
      (f) => (
        <>
          <f.AppField name="first">{(field) => <field.TextField label="First name" />}</f.AppField>
          <f.TextField name="last" label="Last name" />
        </>
      ),
      { defaultValues: { first: '', last: '' } },
    )
    await user.type(screen.getByLabelText('First name'), 'Ada')
    await user.type(screen.getByLabelText('Last name'), 'Lovelace')
    expect(form.state.values).toEqual({ first: 'Ada', last: 'Lovelace' })
  })

  it('extend adds custom fields everywhere; duplicates throw in dev', () => {
    const extended = kit.extend({ fields: { stars: RatingStub } })
    function Review() {
      const form = extended.useAppForm({ defaultValues: { stars: 1 } })
      return (
        <Form form={form} aria-label="Review">
          <form.StarsField name="stars" label="Stars" />
          <output aria-label="Stars value">{form.state.values.stars}</output>
        </Form>
      )
    }
    render(<Review />)
    act(() => {
      screen.getByRole('button', { name: 'Stars' }).click()
    })
    expect(screen.getByRole('button', { name: 'Stars' })).toHaveTextContent('2')
    expect(() => kit.extend({ fields: { text: FormTextField } as never })).toThrow(/already exists/)
    expect(() => createFormKit({ fields: { 'Bad-kind': FormTextField } })).toThrow(/camelCase/)
  })

  it('bound components are memoised per form (useFields returns the same identities)', () => {
    let fromHook: unknown
    const { form } = renderForm(
      (f) => {
        function Inner() {
          fromHook = useFields(f).TextField
          return null
        }
        return <Inner />
      },
      { defaultValues: { name: '' } },
    )
    expect(fromHook).toBe(form.TextField)
    expect(bindFields(form, kit.registries.fields, 'guests[0].')).toBe(
      bindFields(form, kit.registries.fields, 'guests[0].'),
    )
    expect((form.TextField as { displayName?: string }).displayName).toBe('Bound(TextField)')
  })

  it('withForm renders with the parent form and default props', () => {
    const Contact = kit.withForm({
      defaultValues: { email: '' },
      props: { heading: 'Contact details' },
      render: function Contact({ form, heading }) {
        return (
          <>
            <h3>{heading}</h3>
            <form.TextField name="email" label="Email" />
          </>
        )
      },
    })
    renderForm((f) => <Contact form={f} heading="Contact details" />, {
      defaultValues: { email: 'ada@example.com' },
    })
    expect(screen.getByRole('heading', { name: 'Contact details' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
  })

  it('derive recomputes a field without making it dirty', async () => {
    const { form, user } = renderForm((f) => <f.TextField name="first" label="First" />, {
      defaultValues: { first: '', initial: '' },
      derive: [
        { field: 'initial', from: ['first'], compute: (v) => v.first.charAt(0).toUpperCase() },
      ],
    })
    await user.type(screen.getByLabelText('First'), 'ada')
    expect(form.state.values.initial).toBe('A')
    expect(form.getFieldMeta('initial')?.isDirty ?? false).toBe(false)
  })

  describe('derive with nested `from` paths', () => {
    interface Bill {
      total: number | null
      shares: { amount: number | null }[]
      left: number | null
    }
    const derive = [
      {
        field: 'left' as const,
        from: ['total', 'shares'] as const,
        compute: (v: Bill) =>
          (v.total ?? 0) - v.shares.reduce((sum, share) => sum + (share.amount ?? 0), 0),
      },
    ]

    it('recomputes when a path nested under a `from` path changes (shares[0].amount → left)', async () => {
      const { form, user } = renderForm<Bill>(
        (f) => (
          <>
            <f.NumberField name="total" label="Total" />
            <f.NumberField name="shares[0].amount" label="Share 1" />
            <f.NumberField name="left" label="Left" readOnly />
          </>
        ),
        { defaultValues: { total: 10, shares: [{ amount: null }], left: null }, derive },
      )
      await user.type(screen.getByRole('spinbutton', { name: 'Share 1' }), '3')
      expect(form.state.values.left).toBe(7)
      expect(screen.getByRole('spinbutton', { name: 'Left' })).toHaveDisplayValue('7')
    })

    it('does not fire for a sibling path that only shares a prefix (`amountNote` vs `amount`)', async () => {
      const compute = vi.fn(() => 1)
      const { user } = renderForm<{
        amount: number | null
        amountNote: string
        out: number | null
      }>((f) => <f.TextField name="amountNote" label="Note" />, {
        defaultValues: { amount: null, amountNote: '', out: null },
        derive: [{ field: 'out', from: ['amount'], compute }],
      })
      await user.type(screen.getByLabelText('Note'), 'x')
      expect(compute).not.toHaveBeenCalled()
    })

    it('keeps `runtime.changing` on the user’s field while a mounted derived field is written', async () => {
      // Form-level onDynamic runs on change only for a live (blurred) field (§5.2). If the derive
      // write left `changing` on the never-blurred derived field, the error would wait for a blur.
      const { form, user } = renderForm<{ first: string; shout: string }>(
        (f) => (
          <>
            <f.TextField name="first" label="First" />
            <f.TextField name="shout" label="Shout" readOnly />
          </>
        ),
        {
          defaultValues: { first: '', shout: '' },
          derive: [{ field: 'shout', from: ['first'], compute: (v) => v.first.toUpperCase() }],
          validators: {
            onDynamic: ({ value }) =>
              value.first.endsWith('!') ? { fields: { first: 'No shouting' } } : undefined,
          },
        },
      )
      await user.type(screen.getByLabelText('First'), 'ada')
      await user.click(document.body) // blur First without ever touching Shout
      await user.type(screen.getByLabelText('First'), '!')
      expect(form.state.values.shout).toBe('ADA!')
      expect(form.getFieldMeta('first')?.errors).toContain('No shouting')
    })
  })

  it('debounces the user form onChange listener per field', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    const { form } = renderForm((f) => <f.TextField name="q" label="Search" />, {
      defaultValues: { q: '' },
      listeners: { onChange, onChangeDebounceMs: 200 },
    })
    act(() => {
      form.setFieldValue('q', 'a')
    })
    act(() => {
      form.setFieldValue('q', 'ab')
    })
    expect(onChange).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(onChange).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
