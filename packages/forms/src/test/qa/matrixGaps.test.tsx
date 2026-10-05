/**
 * Behaviour tests for §13 coverage-matrix rows that are otherwise covered only by types or stories:
 * #20 cross-field validation clears the *other* field's stale error; #19 onChangeListenTo; #31
 * useFieldValue re-renders a sibling-aware piece; #56 `data-field` on every control; #2 keepDirty
 * false; #3 keepErrors false; #8 onSubmitAsync `{ fields }`; #30 component-mode reset-child
 * listener; #32 grouped options + "All"; #45 analytics onBlur listener; #47 auto-select listener
 * for exclusive branches; #52 FormGrid `start` spacers.
 */
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { Form } from '#components/form/Form'
import { SubmitButton } from '#components/form/SubmitButton'
import { useFieldValue } from '#hooks/useFieldValue'
import { useServerValues } from '#hooks/useServerValues'
import { kit } from '#kit/defaultKit'
import { FormGrid } from '#components/layouts/FormGrid'
import { renderForm } from '#test/renderForm'

describe('§13 #20: cross-field schema refinement clears the other field’s stale error', () => {
  const schema = z
    .object({ password: z.string(), confirm: z.string() })
    .refine((v) => v.password === v.confirm, {
      path: ['confirm'],
      message: 'Passwords don’t match',
    })

  function setup() {
    return renderForm(
      (f) => (
        <>
          <f.TextField name="password" label="Password" />
          <f.TextField name="confirm" label="Confirm password" />
        </>
      ),
      { defaultValues: { password: 'hunter22', confirm: '' }, schema },
    )
  }
  async function showMismatch(user: ReturnType<typeof setup>['user']) {
    await user.type(screen.getByLabelText('Confirm password'), 'hunter2')
    await user.tab()
    expect(await screen.findByText('Passwords don’t match')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'hunter2')
  }

  it('the stale error on confirm clears once password is blurred', async () => {
    const { user } = setup()
    await showMismatch(user)
    await user.tab()
    await waitFor(() => {
      expect(screen.queryByText('Passwords don’t match')).toBeNull()
    })
  })

  // §13 #20: the other field's stale error clears on "any change after first blur/submit". §5.2's
  // predicate is evaluated for the *changed* field, so this needs the form-level check to re-run
  // while the user is still typing in a never-blurred password field.
  it('the stale error on confirm clears while password is being fixed (before its blur)', async () => {
    const { user } = setup()
    await showMismatch(user)
    await waitFor(
      () => {
        expect(screen.queryByText('Passwords don’t match')).toBeNull()
      },
      {
        timeout: 500,
      },
    )
  })
})

describe('§13 #19: field-level onChangeListenTo re-validates a dependant', () => {
  it('confirm re-validates when password changes', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField name="password" label="Password" />
          <f.TextField
            name="confirm"
            label="Confirm password"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password')
                  ? 'Passwords don’t match'
                  : undefined,
            }}
          />
        </>
      ),
      { defaultValues: { password: 'abc', confirm: '' } },
    )
    await user.type(screen.getByLabelText('Confirm password'), 'abd')
    await user.tab()
    expect(await screen.findByText('Passwords don’t match')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'abd')
    await waitFor(() => {
      expect(screen.queryByText('Passwords don’t match')).toBeNull()
    })
  })
})

describe('§13 #31: useFieldValue drives sibling-aware rendering', () => {
  function Hint({ form }: { form: Parameters<typeof useFieldValue>[0] }) {
    const plan: unknown = useFieldValue(form, 'plan' as never)
    return <p>{plan === 'yearly' ? 'Two months free' : 'Billed monthly'}</p>
  }
  it('re-renders with the watched value', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField name="plan" label="Plan" />
          <Hint form={f} />
        </>
      ),
      { defaultValues: { plan: 'monthly' } },
    )
    expect(screen.getByText('Billed monthly')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Plan'))
    await user.type(screen.getByLabelText('Plan'), 'yearly')
    expect(screen.getByText('Two months free')).toBeInTheDocument()
  })
})

describe('§13 #56: a stable data-field={name} on every kind', () => {
  type F = Parameters<Parameters<typeof renderForm<Record<string, unknown>>>[0]>[0]
  const o = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Bravo' },
  ]
  const n = 'pick' as never
  const kinds: Record<string, [unknown, (f: F) => ReactNode]> = {
    text: ['', (f) => <f.TextField name={n} label="Pick" />],
    textarea: ['', (f) => <f.TextareaField name={n} label="Pick" />],
    select: [null, (f) => <f.SelectField name={n} label="Pick" options={o as never} />],
    checkbox: [false, (f) => <f.CheckboxField name={n} label="Pick" />],
    date: ['', (f) => <f.DateField name={n} label="Pick" />],
    time: ['', (f) => <f.TimeField name={n} label="Pick" />],
    dateTime: ['', (f) => <f.DateTimeField name={n} label="Pick" />],
    hidden: ['x', (f) => <f.HiddenField name={n} />],
    password: ['', (f) => <f.PasswordField name={n} label="Pick" autoComplete="new-password" />],
    number: [null, (f) => <f.NumberField name={n} label="Pick" />],
    amount: [null, (f) => <f.AmountField name={n} label="Pick" currency="AUD" />],
    oneTimeCode: ['', (f) => <f.OneTimeCodeField name={n} label="Pick" />],
    color: ['', (f) => <f.ColorField name={n} label="Pick" />],
    switch: [false, (f) => <f.SwitchField name={n} label="Pick" />],
    dateRange: [{ start: '', end: '' }, (f) => <f.DateRangeField name={n} label="Pick" />],
    radio: [null, (f) => <f.RadioField name={n} label="Pick" options={o as never} />],
    segmented: [null, (f) => <f.SegmentedField name={n} label="Pick" options={o as never} />],
    choiceCards: [null, (f) => <f.ChoiceCardsField name={n} label="Pick" options={o as never} />],
    multiChoiceCards: [
      [],
      (f) => <f.MultiChoiceCardsField name={n} label="Pick" options={o as never} />,
    ],
    checkboxGroup: [[], (f) => <f.CheckboxGroupField name={n} label="Pick" options={o as never} />],
    chips: [[], (f) => <f.ChipsField name={n} label="Pick" options={o as never} />],
    slider: [0, (f) => <f.SliderField name={n} label="Pick" />],
    range: [[0, 100], (f) => <f.RangeField name={n} label="Pick" />],
    rating: [null, (f) => <f.RatingField name={n} label="Pick" />],
    combobox: [null, (f) => <f.ComboboxField name={n} label="Pick" options={o as never} />],
    multiSelect: [[], (f) => <f.MultiSelectField name={n} label="Pick" options={o as never} />],
    tags: [[], (f) => <f.TagsField name={n} label="Pick" />],
    file: [[], (f) => <f.FileField name={n} label="Pick" />],
  }
  it('covers all 28 kinds', () => {
    expect(Object.keys(kinds)).toHaveLength(28)
  })
  for (const [kind, [value, build]] of Object.entries(kinds)) {
    it(kind, async () => {
      const { container } = renderForm<Record<string, unknown>>((f) => build(f), {
        defaultValues: { pick: value },
      })
      await act(() => Promise.resolve())
      expect(container.querySelector('[data-field="pick"]')).not.toBeNull()
    })
  }
})

// ── Server values, submit errors, listeners, options and grid ───────────────────────────────

describe('§13 #2 / #3: useServerValues with keepDirty / keepErrors off', () => {
  interface Contact {
    name: string
    email: string
  }
  let current: ReturnType<typeof kit.useAppForm<Contact>> | null = null
  function Edit({
    data,
    keepDirty,
    keepErrors,
  }: {
    data: Contact
    keepDirty?: boolean
    keepErrors?: boolean
  }) {
    const form = kit.useAppForm<Contact>({ defaultValues: { name: '', email: '' } })
    current = form
    useServerValues(form, data, {
      ...(keepDirty !== undefined ? { keepDirty } : {}),
      ...(keepErrors !== undefined ? { keepErrors } : {}),
    })
    return (
      <Form form={form} aria-label="Contact">
        <form.TextField name="name" label="Name" />
        <form.TextField name="email" label="Email" />
      </Form>
    )
  }
  const v1: Contact = { name: 'Ada', email: 'ada@old.example' }

  it('#2 keepDirty: false — a refresh replaces the user’s edits with the server values', async () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention -- a false positive: this is userEvent, not a render
    const user = userEvent.setup()
    const { rerender } = render(<Edit data={v1} keepDirty={false} />)
    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Ada L')
    rerender(<Edit data={{ ...v1, email: 'ada@new.example' }} keepDirty={false} />)
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    expect(screen.getByLabelText('Email')).toHaveValue('ada@new.example')
    expect(current?.state.isDefaultValue).toBe(true)
  })

  it('#3 keepErrors: false — visible errors are dropped by a refresh', async () => {
    const { rerender } = render(<Edit data={v1} keepErrors={false} />)
    act(() => {
      current?.setFieldMeta('name', (prev) => ({
        ...prev,
        isBlurred: true,
        errorMap: { onServer: 'Name is reserved' },
      }))
    })
    expect(await screen.findByText('Name is reserved')).toBeInTheDocument()
    rerender(<Edit data={{ ...v1, email: 'x@y.z' }} keepErrors={false} />)
    expect(screen.queryByText('Name is reserved')).toBeNull()
  })
})

describe('§13 #8: TanStack onSubmitAsync returning { fields } maps errors to fields', () => {
  it('shows the routed field error, blocks onSubmit, and clears the error on the next edit', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField name="email" label="Email" />
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      {
        defaultValues: { email: 'taken@example.com' },
        onSubmit,
        validators: {
          onSubmitAsync: ({ value }) =>
            Promise.resolve(
              value.email === 'taken@example.com'
                ? { fields: { email: 'That email is taken' } }
                : undefined,
            ),
        },
      },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('That email is taken')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    await user.type(screen.getByLabelText('Email'), 'x')
    await waitFor(() => {
      expect(screen.queryByText('That email is taken')).toBeNull()
    })
  })
})

describe('§13 #30: component mode — a field listener resets the child when the parent changes', () => {
  it('changing country clears city', async () => {
    const { user, form } = renderForm(
      (f) => (
        <>
          <f.TextField
            name="country"
            label="Country"
            listeners={{
              onChange: ({ fieldApi }) => {
                fieldApi.form.setFieldValue('city', '')
              },
            }}
          />
          <f.TextField name="city" label="City" />
        </>
      ),
      { defaultValues: { country: 'AU', city: 'Sydney' } },
    )
    await user.type(screen.getByLabelText('Country'), 'S')
    expect(form.state.values.city).toBe('')
    expect(screen.getByLabelText('City')).toHaveValue('')
  })
})

describe('§13 #32: grouped options and "All"', () => {
  it('FormCheckboxGroupField selectAllLabel selects every option and stores them all', async () => {
    const { user, form } = renderForm(
      (f) => (
        <f.CheckboxGroupField
          name="notify"
          label="Notify me about"
          selectAllLabel="Everything"
          options={[
            { value: 'comments', label: 'New comments' },
            { value: 'mentions', label: 'Mentions' },
            { value: 'digest', label: 'Weekly digest' },
          ]}
        />
      ),
      { defaultValues: { notify: [] as string[] } },
    )
    await user.click(screen.getByRole('checkbox', { name: 'Everything' }))
    expect([...form.state.values.notify].sort()).toEqual(['comments', 'digest', 'mentions'])
  })

  it('FormComboboxField renders FieldOption.group as headed groups', async () => {
    const { user } = renderForm(
      (f) => (
        <f.ComboboxField
          name="city"
          label="City"
          options={[
            { value: 'lis', label: 'Lisbon', group: 'Europe' },
            { value: 'rom', label: 'Rome', group: 'Europe' },
            { value: 'tyo', label: 'Tokyo', group: 'Asia' },
          ]}
        />
      ),
      { defaultValues: { city: null as string | null } },
    )
    await user.click(screen.getByRole('combobox', { name: 'City' }))
    const europe = screen.getByRole('group', { name: 'Europe' })
    expect(
      within(europe)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Lisbon', 'Rome'])
    expect(
      within(screen.getByRole('group', { name: 'Asia' })).getByRole('option', {
        name: 'Tokyo',
      }),
    ).toBeInTheDocument()
  })
})

describe('§13 #45: analytics — listeners.onBlur fires only when the field was edited', () => {
  it('a blur without an edit sends nothing; an edit then blur sends once', async () => {
    const track = vi.fn()
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField
            name="name"
            label="Name"
            listeners={{
              onBlur: ({ value, fieldApi }) => {
                if (fieldApi.state.meta.isDirty) track('name_edited', value)
              },
            }}
          />
          <f.TextField name="other" label="Other" />
        </>
      ),
      { defaultValues: { name: '', other: '' } },
    )
    await user.click(screen.getByLabelText('Name'))
    await user.tab()
    expect(track).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.tab()
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('name_edited', 'Ada')
  })
})

describe('§13 #47: mutually exclusive branches — excluded + an auto-select listener', () => {
  function Payment({ f }: { f: Parameters<Parameters<typeof renderForm<PaymentValues>>[0]>[0] }) {
    const method = useFieldValue(f, 'method')
    return (
      <>
        <f.TextField name="method" label="Method" />
        <f.TextField
          name="card"
          label="Card number"
          excluded={method !== 'card'}
          listeners={{
            onChange: ({ fieldApi }) => {
              fieldApi.form.setFieldValue('method', 'card')
            },
          }}
        />
        <f.TextField
          name="bsb"
          label="BSB"
          excluded={method !== 'bank'}
          listeners={{
            onChange: ({ fieldApi }) => {
              fieldApi.form.setFieldValue('method', 'bank')
            },
          }}
        />
        <SubmitButton>Pay</SubmitButton>
      </>
    )
  }
  interface PaymentValues {
    method: string
    card: string
    bsb: string
  }

  it('typing into a branch selects it; the other branch is excluded and submits its default', async () => {
    const onSubmit = vi.fn()
    const { user } = renderForm<PaymentValues>((f) => <Payment f={f} />, {
      defaultValues: { method: 'card', card: '', bsb: '' },
      onSubmit,
    })
    await user.type(screen.getByLabelText('Card number'), '4111')
    await user.type(screen.getByLabelText('BSB'), '062')
    expect(screen.getByLabelText('Method')).toHaveValue('bank')
    await user.click(screen.getByRole('button', { name: 'Pay' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    const submitted = (onSubmit.mock.calls[0]?.[0] as { value: PaymentValues }).value
    expect(submitted).toEqual({ method: 'bank', card: '', bsb: '062' })
  })
})

describe('§13 #52: FormGrid start spacers', () => {
  it('FormGrid.Item start offsets the cell (a spacer without an empty cell)', () => {
    const { container } = renderForm(
      (f) => (
        <FormGrid columns={3}>
          <FormGrid.Item start={2}>
            <f.TextField name="postcode" label="Postcode" />
          </FormGrid.Item>
        </FormGrid>
      ),
      { defaultValues: { postcode: '' } },
    )
    const cell = screen.getByLabelText('Postcode').closest('[style*="grid-item-start"]')
    expect(cell).not.toBeNull()
    expect((cell as HTMLElement).getAttribute('style')).toMatch(/grid-item-start[^:]*:\s*2/)
    // No placeholder element was needed for the empty first column.
    expect(container.querySelectorAll('input')).toHaveLength(1)
  })
})
