import { useEffect } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Stack } from '@mitcsutt/kiln-ui'
import { Form } from '#components/Form'
import type { KitFormOptions, LayoutRenderProps } from '#core/kit/types'
import type { OptionsLoader } from '#core/hooks/useOptions'
import { getFormRuntime } from '#core/runtime/formRuntime'
import { kit } from '#kit'
import { defineComputer, defineLoader, defineValidator } from '#schema/core/registry'
import type { UntypedFormSchema } from '#schema/core/types'
import { defineCustomNode } from '#schema/render/defineCustomNode'
import { resetWarnings } from '#schema/render/warn'
import { renderForm } from '#test/renderForm'

// A kit with every schema registry filled (§10.5).
const TeamBadge = defineCustomNode<{ teamId: string; compact?: boolean }>(function TeamBadge({
  form,
  props,
  node,
}) {
  return (
    <p data-testid="badge" data-form={'store' in form ? 'yes' : 'none'} data-node={node.custom}>
      {`Team ${props.teamId}${props.compact === true ? ' (compact)' : ''}`}
    </p>
  )
})

function Timeline({ node, form, children, title }: LayoutRenderProps & { title: string }) {
  return (
    <section
      aria-label={title}
      data-layout={node.layout}
      data-has-form={'store' in form ? 'yes' : 'no'}
    >
      {children}
    </section>
  )
}

const teams = defineLoader<string>(({ values }) => {
  const league = (values as { league?: string }).league
  return Promise.resolve(
    league === 'weekend'
      ? [{ value: 'ash', label: 'Ashgrove Athletic' }]
      : [
          { value: 'riv', label: 'Riverside Rovers' },
          { value: 'har', label: 'Harbour United' },
        ],
  )
})

const schemaKit = kit.extend({
  loaders: { teams },
  validators: {
    notTaken: defineValidator<string>((value) =>
      value === 'taken' ? 'That name is taken' : undefined,
    ),
    slowCheck: defineValidator<string>(
      async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 5))
        return value === 'slow' ? 'Checked remotely and rejected' : undefined
      },
      { async: true },
    ),
  },
  computers: {
    total: defineComputer((values) => {
      const v = values as { price: number | null; quantity: number | null }
      return (v.price ?? 0) * (v.quantity ?? 0)
    }),
    left: defineComputer((values) => {
      const v = values as { amount: number | null; splits: { amount: number | null }[] }
      return (v.amount ?? 0) - v.splits.reduce((total, line) => total + (line.amount ?? 0), 0)
    }),
  },
  nodes: { teamBadge: TeamBadge },
  layouts: { timeline: Timeline },
})

const search = vi.fn<OptionsLoader<string>>()
const comboKit = schemaKit.extend({
  loaders: { search: defineLoader<string>((ctx) => search(ctx)) },
})

type Kit = typeof kit | typeof schemaKit | typeof comboKit

function renderSchema<T>(
  schema: UntypedFormSchema,
  options: KitFormOptions<T> & {
    context?: Record<string, unknown>
    mode?: 'edit' | 'view'
    using?: Kit
    extra?: ReactNode
  },
) {
  const { context, mode, using = schemaKit, extra, ...formOptions } = options
  const holder: { form?: ReturnType<typeof kit.useAppForm<T>> } = {}
  function Harness() {
    const form = using.useAppForm<T>(formOptions)
    useEffect(() => {
      holder.form = form
    })
    return (
      <Form form={form} aria-label="Schema form" mode={mode}>
        <using.SchemaForm form={form} schema={schema} context={context} />
        {extra}
      </Form>
    )
  }
  const user = userEvent.setup()
  const view = render(<Harness />)
  if (!holder.form) throw new Error('no form')
  return { ...view, form: holder.form, user }
}

const submit = async (user: ReturnType<typeof userEvent.setup>, name = 'Save') => {
  await user.click(screen.getByRole('button', { name }))
}

describe('SchemaForm', () => {
  let warn: MockInstance<typeof console.warn>
  beforeEach(() => {
    resetWarnings()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('renders field nodes through the kit (labels, props, static required rule)', async () => {
    const onSubmit = vi.fn()
    const schema = schemaKit.defineFormSchema<{ name: string; age: number | null }>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'text', name: 'name', label: 'Full name', required: true },
          {
            kind: 'number',
            name: 'age',
            label: 'Age',
            rules: [{ rule: 'min', value: 16, message: 'Players must be 16 or over' }],
          },
          { content: 'submit', label: 'Save' },
        ],
      },
    })
    const { user } = renderSchema(schema, { defaultValues: { name: '', age: null }, onSubmit })
    const name = screen.getByRole('textbox', { name: /Full name/ })
    expect(name).toBeRequired()
    await user.type(screen.getByRole('spinbutton', { name: 'Age' }), '12')
    await submit(user)
    expect(await screen.findByText('Players must be 16 or over')).toBeInTheDocument()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('custom sync and async validators run from the kit registry', async () => {
    const onSubmit = vi.fn()
    const schema = schemaKit.defineFormSchema<{ handle: string }>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'text',
            name: 'handle',
            label: 'Handle',
            rules: [
              { rule: 'custom', validator: 'notTaken' },
              { rule: 'custom', validator: 'slowCheck' },
            ],
          },
          { content: 'submit', label: 'Save' },
        ],
      },
    })
    const { user } = renderSchema(schema, { defaultValues: { handle: '' }, onSubmit })
    const handle = screen.getByLabelText('Handle')
    await user.type(handle, 'taken')
    await user.tab()
    expect(await screen.findByText('That name is taken')).toBeInTheDocument()
    await user.clear(handle)
    await user.type(handle, 'slow')
    await user.tab()
    expect(
      await screen.findByText('Checked remotely and rejected', undefined, { timeout: 2000 }),
    ).toBeInTheDocument()
    await user.clear(handle)
    await user.type(handle, 'fine')
    await submit(user)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('hidden fields are unmounted, skip validation and are pruned at submit (whenHidden)', async () => {
    const onSubmit = vi.fn()
    interface V {
      method: 'delivery' | 'pickup'
      address: string
      note: string
    }
    const schema = schemaKit.defineFormSchema<V>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'radio',
            name: 'method',
            label: 'Method',
            options: [
              { value: 'delivery', label: 'Delivery' },
              { value: 'pickup', label: 'Pick up' },
            ],
          },
          {
            kind: 'text',
            name: 'address',
            label: 'Address',
            required: true,
            when: { field: 'method', op: 'eq', value: 'delivery' },
          },
          {
            kind: 'text',
            name: 'note',
            label: 'Note',
            whenHidden: 'keep',
            when: { field: 'method', op: 'eq', value: 'delivery' },
          },
          { content: 'submit', label: 'Save' },
        ],
      },
    })
    const { user } = renderSchema<V>(schema, {
      defaultValues: { method: 'delivery', address: '', note: '' },
      onSubmit: ({ value }) => {
        onSubmit(value)
      },
      afterSubmit: 'keep',
    })
    await user.type(screen.getByLabelText(/Address/), 'x')
    await user.type(screen.getByLabelText('Note'), 'Ring twice')
    await user.clear(screen.getByLabelText(/Address/))
    await submit(user)
    expect(await screen.findByText('Enter a value', { exact: false })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Address/), '1 High St')
    await user.click(screen.getByRole('radio', { name: 'Pick up' }))
    expect(screen.queryByLabelText(/Address/)).toBeNull()
    await submit(user)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    // address pruned to its default; note kept (whenHidden: 'keep').
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      method: 'pickup',
      address: '',
      note: 'Ring twice',
    })
  })

  it('a hidden subtree that never mounted is still pruned (static names from the analysis)', async () => {
    const onSubmit = vi.fn()
    interface V {
      hasPromo: boolean
      promo: { code: string }
    }
    const schema = schemaKit.defineFormSchema<V>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'checkbox', name: 'hasPromo', label: 'I have a promo code' },
          {
            layout: 'section',
            title: 'Promo',
            when: { field: 'hasPromo', op: 'truthy' },
            children: [
              {
                kind: 'text',
                name: 'promo.code',
                label: 'Code',
                rules: [{ rule: 'minLength', value: 20 }],
              },
            ],
          },
          { content: 'submit', label: 'Save' },
        ],
      },
    })
    const { user, form } = renderSchema<V>(schema, {
      defaultValues: { hasPromo: false, promo: { code: '' } },
      onSubmit: ({ value }) => {
        onSubmit(value)
      },
    })
    // A server value for a field that never rendered.
    act(() => {
      form.setFieldValue('promo.code', 'SERVER')
    })
    expect(screen.queryByLabelText('Code')).toBeNull()
    expect(getFormRuntime(form).inactive.get('promo.code')).toEqual({
      reason: 'hidden',
      submit: 'prune',
    })
    await submit(user)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ hasPromo: false, promo: { code: '' } })
  })

  it('context conditions: when / readOnlyWhen read the render context', () => {
    interface V {
      email: string
      role: string
    }
    const schema = schemaKit.defineFormSchema<
      V,
      { mode: 'create' | 'edit'; role: 'organiser' | 'player' }
    >()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'text',
            name: 'email',
            label: 'Email',
            readOnlyWhen: { context: 'mode', op: 'eq', value: 'edit' },
          },
          {
            kind: 'text',
            name: 'role',
            label: 'Role',
            when: { context: 'role', op: 'eq', value: 'organiser' },
          },
        ],
      },
    })
    const { unmount } = renderSchema<V>(schema, {
      defaultValues: { email: '', role: '' },
      context: { mode: 'create', role: 'organiser' },
    })
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('readonly')
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
    unmount()
    renderSchema<V>(schema, {
      defaultValues: { email: 'a@b.co', role: '' },
      context: { mode: 'edit', role: 'player' },
    })
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly')
    expect(screen.queryByLabelText('Role')).toBeNull()
  })

  it('disabledWhen / requiredWhen / excludeWhen flip with the values', async () => {
    const onSubmit = vi.fn()
    interface V {
      plan: 'free' | 'pro'
      company: string
      seats: number | null
      coupon: string
    }
    const schema = schemaKit.defineFormSchema<V>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'segmented',
            name: 'plan',
            label: 'Plan',
            options: [
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
            ],
          },
          {
            kind: 'text',
            name: 'company',
            label: 'Company',
            requiredWhen: { field: 'plan', op: 'eq', value: 'pro' },
          },
          {
            kind: 'number',
            name: 'seats',
            label: 'Seats',
            disabledWhen: { field: 'plan', op: 'eq', value: 'free' },
          },
          {
            kind: 'text',
            name: 'coupon',
            label: 'Coupon',
            excludeWhen: { field: 'plan', op: 'eq', value: 'free' },
          },
          { content: 'submit', label: 'Save' },
        ],
      },
    })
    const { user } = renderSchema<V>(schema, {
      defaultValues: { plan: 'free', company: '', seats: null, coupon: '' },
      onSubmit: ({ value }) => {
        onSubmit(value)
      },
      afterSubmit: 'keep',
    })
    expect(screen.getByRole('textbox', { name: /Company/ })).not.toBeRequired()
    expect(screen.getByRole('spinbutton', { name: 'Seats' })).toBeDisabled()
    await user.type(screen.getByLabelText('Coupon'), 'SAVE10')
    await submit(user)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ coupon: '' }) // excluded → default
    await user.click(screen.getByRole('radio', { name: 'Pro' }))
    expect(screen.getByRole('textbox', { name: /Company/ })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: 'Seats' })).toBeEnabled()
    await submit(user)
    expect(await screen.findByRole('textbox', { name: /Company/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('optionsFrom loads options from the registry and reloads when a dep changes; resets clears the dependant', async () => {
    interface V {
      league: 'weekday' | 'weekend'
      team: string | null
    }
    const schema = schemaKit.defineFormSchema<V>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'radio',
            name: 'league',
            label: 'League',
            options: [
              { value: 'weekday', label: 'Weekday evenings' },
              { value: 'weekend', label: 'Weekend mornings' },
            ],
            resets: ['team'],
          },
          {
            kind: 'radio',
            name: 'team',
            label: 'Team',
            optionsFrom: { loader: 'teams', deps: ['league'] },
          },
        ],
      },
    })
    const { user, form } = renderSchema<V>(schema, {
      defaultValues: { league: 'weekday', team: null },
    })
    const team = await screen.findByRole('group', { name: 'Team' })
    expect(await within(team).findByRole('radio', { name: 'Riverside Rovers' })).toBeInTheDocument()
    await user.click(within(team).getByRole('radio', { name: 'Harbour United' }))
    expect(form.state.values.team).toBe('har')
    await user.click(screen.getByRole('radio', { name: 'Weekend mornings' }))
    expect(
      await within(screen.getByRole('group', { name: 'Team' })).findByRole('radio', {
        name: 'Ashgrove Athletic',
      }),
    ).toBeInTheDocument()
    expect(form.state.values.team).toBeNull()
  })

  describe('compute (runtime derive registration)', () => {
    interface V {
      price: number | null
      quantity: number | null
      showTotal: boolean
      total: number | null
    }
    const computeSchema = schemaKit.defineFormSchema<V>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'number', name: 'price', label: 'Price' },
          { kind: 'number', name: 'quantity', label: 'Quantity' },
          { kind: 'checkbox', name: 'showTotal', label: 'Show total' },
          {
            kind: 'number',
            name: 'total',
            label: 'Total',
            compute: { computer: 'total', from: ['price', 'quantity'] },
            when: { field: 'showTotal', op: 'truthy' },
            whenHidden: 'keep',
          },
          { content: 'submit', label: 'Save' },
        ],
      },
    })
    const defaults: V = { price: 3, quantity: null, showTotal: true, total: null }

    it('never runs on mount: a pristine form stays clean', () => {
      const { form } = renderSchema<V>(computeSchema, { defaultValues: defaults })
      expect(form.state.values.total).toBeNull()
      expect(form.state.isDefaultValue).toBe(true)
      expect(screen.getByRole('spinbutton', { name: 'Total' })).toHaveAttribute('readonly')
    })

    it('recomputes on a `from` change, also while the computed field is hidden (keep), and submits the fresh value', async () => {
      const onSubmit = vi.fn()
      const { user, form } = renderSchema<V>(computeSchema, {
        defaultValues: defaults,
        onSubmit: ({ value }) => {
          onSubmit(value)
        },
      })
      await user.type(screen.getByRole('spinbutton', { name: 'Quantity' }), '4')
      expect(form.state.values.total).toBe(12)
      await user.click(screen.getByLabelText('Show total'))
      expect(screen.queryByRole('spinbutton', { name: 'Total' })).toBeNull()
      await user.clear(screen.getByRole('spinbutton', { name: 'Price' }))
      await user.type(screen.getByRole('spinbutton', { name: 'Price' }), '5')
      expect(form.state.values.total).toBe(20)
      await submit(user)
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
      expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ price: 5, quantity: 4, total: 20 })
    })

    it('matches component-mode `derive` for the same input', async () => {
      const derive = [
        {
          field: 'total' as const,
          from: ['price', 'quantity'] as const,
          compute: (v: V) => (v.price ?? 0) * (v.quantity ?? 0),
        },
      ]
      const view = renderForm<V>(
        (f) => (
          <>
            <f.NumberField name="price" label="Price" />
            <f.NumberField name="quantity" label="Quantity" />
            <f.NumberField name="total" label="Total" readOnly />
          </>
        ),
        { defaultValues: defaults, derive },
      )
      const run = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.type(screen.getByRole('spinbutton', { name: 'Quantity' }), '2')
        await user.clear(screen.getByRole('spinbutton', { name: 'Price' }))
        await user.type(screen.getByRole('spinbutton', { name: 'Price' }), '7')
      }
      expect(view.form.state.isDefaultValue).toBe(true)
      await run(view.user)
      const fromComponent = { ...view.form.state.values }
      view.unmount()
      const { form, user } = renderSchema<V>(computeSchema, { defaultValues: defaults })
      expect(form.state.isDefaultValue).toBe(true)
      await run(user)
      expect(form.state.values).toEqual(fromComponent)
      expect(fromComponent.total).toBe(14)
    })

    it('recomputes when a path nested under a `from` path changes (a split amount under `splits` updates what is left to allocate)', async () => {
      interface Claim {
        amount: number | null
        splits: { amount: number | null }[]
        left: number | null
      }
      const schema = schemaKit.defineFormSchema<Claim>()({
        version: 1,
        root: {
          layout: 'stack',
          children: [
            { kind: 'number', name: 'amount', label: 'Amount' },
            {
              layout: 'repeater',
              name: 'splits',
              label: 'Splits',
              newItem: { amount: null },
              addLabel: 'Add split',
              item: [{ kind: 'number', name: 'amount', label: 'Split amount' }],
            },
            {
              kind: 'number',
              name: 'left',
              label: 'Left to allocate',
              compute: { computer: 'left', from: ['amount', 'splits'] },
            },
          ],
        },
      })
      const { user, form } = renderSchema<Claim>(schema, {
        defaultValues: { amount: 10, splits: [{ amount: null }], left: null },
      })
      await user.type(screen.getByRole('spinbutton', { name: 'Split amount' }), '3')
      expect(form.state.values.left).toBe(7)
      await user.type(screen.getByRole('spinbutton', { name: 'Split amount' }), '0')
      expect(form.state.values.left).toBe(-20)
    })

    it('unregisters when the renderer unmounts', () => {
      const { form, unmount } = renderSchema<V>(computeSchema, { defaultValues: defaults })
      expect(getFormRuntime(form).derive.size).toBe(1)
      unmount()
      expect(getFormRuntime(form).derive.size).toBe(0)
    })
  })

  describe('optionsFrom on a loading field (combobox)', () => {
    interface V {
      league: string
      team: string | null
    }
    const comboSchema = comboKit.defineFormSchema<V>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'text', name: 'league', label: 'League code' },
          {
            kind: 'combobox',
            name: 'team',
            label: 'Team',
            placeholder: 'Search',
            optionsFrom: { loader: 'search', deps: ['league'] },
          },
        ],
      },
    })

    beforeEach(() => {
      vi.useFakeTimers()
      search.mockReset()
    })
    afterEach(() => vi.useRealTimers())

    it('passes the typed query to the loader and reloads on its deps', async () => {
      search.mockImplementation(({ query }) =>
        Promise.resolve([{ value: 'riv', label: `Riverside Rovers ${query}` }]),
      )
      renderSchema<V>(comboSchema, {
        defaultValues: { league: 'weekday', team: null },
        using: comboKit,
      })
      await act(() => {
        vi.advanceTimersByTime(0)
        return Promise.resolve()
      })
      expect(search.mock.calls.map(([ctx]) => ctx.query)).toEqual([''])
      fireEvent.change(screen.getByRole('combobox', { name: 'Team' }), {
        target: { value: 'ar' },
      })
      await act(() => Promise.resolve())
      await act(() => {
        vi.advanceTimersByTime(300)
        return Promise.resolve()
      })
      expect(search.mock.calls.map(([ctx]) => ctx.query)).toEqual(['', 'ar'])
      fireEvent.change(screen.getByLabelText('League code'), { target: { value: 'weekend' } })
      await act(() => Promise.resolve())
      await act(() => {
        vi.advanceTimersByTime(300)
        return Promise.resolve()
      })
      expect(search).toHaveBeenCalledTimes(3)
      expect((search.mock.calls[2]?.[0].values as V).league).toBe('weekend')
    })

    it('shows the failed message when the loader rejects', async () => {
      search.mockImplementation(() => Promise.reject(new Error('offline')))
      renderSchema<V>(comboSchema, {
        defaultValues: { league: 'weekday', team: null },
        using: comboKit,
      })
      await act(() => {
        vi.advanceTimersByTime(0)
        return Promise.resolve()
      })
      fireEvent.click(screen.getByRole('combobox', { name: 'Team' }))
      await act(() => Promise.resolve())
      expect(screen.getByText("Couldn't load options")).toBeInTheDocument()
    })

    it('makes no call in view mode', async () => {
      search.mockImplementation(() => Promise.resolve([]))
      renderSchema<V>(comboSchema, {
        defaultValues: { league: 'weekday', team: 'riv' },
        using: comboKit,
        mode: 'view',
      })
      await act(() => {
        vi.advanceTimersByTime(500)
        return Promise.resolve()
      })
      expect(search).not.toHaveBeenCalled()
      expect(screen.getByText('riv')).toBeInTheDocument()
    })
  })

  it('a `reset` content node without a label renders the default "Reset" button', () => {
    const schema = schemaKit.defineFormSchema<{ name: string }>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [{ kind: 'text', name: 'name', label: 'Name' }, { content: 'reset' }],
      },
    })
    renderSchema(schema, { defaultValues: { name: '' } })
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveAttribute('type', 'reset')
    expect(warn).not.toHaveBeenCalled()
  })

  it('warnRules show a non-blocking warning', async () => {
    const onSubmit = vi.fn()
    const schema = schemaKit.defineFormSchema<{ email: string }>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'text',
            name: 'email',
            label: 'Email',
            warnRules: [
              {
                rule: 'pattern',
                value: '@work\\.example$',
                message: 'Use your work email if you have one',
              },
            ],
          },
          { content: 'submit', label: 'Save' },
        ],
      },
    })
    const { user } = renderSchema(schema, { defaultValues: { email: '' }, onSubmit })
    await user.type(screen.getByLabelText('Email'), 'me@home.example')
    await user.tab()
    expect(await screen.findByText('Use your work email if you have one')).toBeInTheDocument()
    await submit(user)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('repeater: item nodes bind under name[i], array rules show as the group error, item `when` reads root paths', async () => {
    const onSubmit = vi.fn()
    interface V {
      showDiet: boolean
      guests: { name: string; diet: string }[]
    }
    const schema = schemaKit.defineFormSchema<V>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'checkbox', name: 'showDiet', label: 'Ask about dietary needs' },
          {
            layout: 'repeater',
            name: 'guests',
            label: 'Guests',
            newItem: { name: '', diet: '' },
            addLabel: 'Add guest',
            rules: [{ rule: 'minItems', value: 2, message: 'Invite at least two guests' }],
            item: [
              { kind: 'text', name: 'name', label: 'Name' },
              {
                kind: 'text',
                name: 'diet',
                label: 'Dietary needs',
                when: { field: 'showDiet', op: 'truthy' },
              },
            ],
          },
          { content: 'submit', label: 'Save' },
        ],
      },
    })
    const { user, form } = renderSchema<V>(schema, {
      defaultValues: { showDiet: false, guests: [] },
      onSubmit: ({ value }) => {
        onSubmit(value)
      },
    })
    await user.click(screen.getByRole('button', { name: 'Add guest' }))
    await user.type(screen.getByLabelText('Name'), 'Amara')
    expect(form.state.values.guests).toEqual([{ name: 'Amara', diet: '' }])
    expect(screen.queryByLabelText('Dietary needs')).toBeNull()
    await user.click(screen.getByLabelText('Ask about dietary needs'))
    await user.type(screen.getByLabelText('Dietary needs'), 'Vegan')
    expect(form.state.values.guests[0]?.diet).toBe('Vegan')
    await submit(user)
    expect(await screen.findByText('Invite at least two guests')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders custom nodes with { form, props, node } and custom layouts with { node, form, children }', () => {
    const schema = schemaKit.defineFormSchema<{ name: string }>()({
      version: 1,
      root: {
        layout: 'timeline',
        title: 'Season',
        children: [
          { kind: 'text', name: 'name', label: 'Name' },
          { custom: 'teamBadge', props: { teamId: 'riv', compact: true } },
        ],
      },
    })
    renderSchema(schema, { defaultValues: { name: '' } })
    const region = screen.getByRole('region', { name: 'Season' })
    expect(region).toHaveAttribute('data-layout', 'timeline')
    expect(region).toHaveAttribute('data-has-form', 'yes')
    expect(within(region).getByLabelText('Name')).toBeInTheDocument()
    const badge = within(region).getByTestId('badge')
    expect(badge).toHaveTextContent('Team riv (compact)')
    expect(badge).toHaveAttribute('data-form', 'yes')
    expect(badge).toHaveAttribute('data-node', 'teamBadge')
  })

  it('unknown keys (untrusted schemas) render nothing and warn in dev', () => {
    const schema: UntypedFormSchema = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'phone', name: 'phone', label: 'Phone' },
          { layout: 'carousel', children: [{ kind: 'text', name: 'inside', label: 'Inside' }] },
          { custom: 'map' },
          { kind: 'text', name: 'name', label: 'Name' },
        ],
      },
    }
    renderSchema<Record<string, string>>(schema, {
      defaultValues: { phone: '', inside: '', name: '' },
      using: kit,
    })
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Phone')).toBeNull()
    expect(screen.queryByLabelText('Inside')).toBeNull()
    const messages = warn.mock.calls.map((call) => String(call[0]))
    expect(messages.some((m) => m.includes('Unknown field kind "phone"'))).toBe(true)
    expect(messages.some((m) => m.includes('Unknown layout "carousel"'))).toBe(true)
    expect(messages.some((m) => m.includes('Unknown custom node "map"'))).toBe(true)
  })

  it('view mode renders the same schema read-only without creating field instances', () => {
    const schema = schemaKit.defineFormSchema<{ name: string; guests: { name: string }[] }>()({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'text', name: 'name', label: 'Full name', rules: [{ rule: 'required' }] },
          {
            layout: 'repeater',
            name: 'guests',
            label: 'Guests',
            newItem: { name: '' },
            item: [{ kind: 'text', name: 'name', label: 'Guest' }],
          },
        ],
      },
    })
    const { form } = renderSchema(schema, {
      defaultValues: { name: 'Priya Shah', guests: [{ name: 'Tom' }] },
      mode: 'view',
    })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('Priya Shah')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
    const info = (
      form as unknown as { fieldInfo: Record<string, { instance: unknown } | undefined> }
    ).fieldInfo
    expect(info.name?.instance ?? null).toBeNull()
    expect(info.guests?.instance ?? null).toBeNull()
  })
})

describe('SchemaNode', () => {
  it('renders one node by id anywhere in JSX', () => {
    const schema = kit.defineFormSchema<{ name: string; email: string }>()({
      version: 1,
      root: {
        layout: 'section',
        title: 'You',
        children: [
          { kind: 'text', name: 'name', label: 'Full name', id: 'name' },
          { kind: 'text', name: 'email', label: 'Email', id: 'email' },
        ],
      },
    })
    function Harness() {
      const form = kit.useAppForm({ defaultValues: { name: '', email: 'me@example.com' } })
      return (
        <Form form={form} aria-label="Mixed">
          <Stack gap={4}>
            <p>Hand-written intro.</p>
            <kit.SchemaNode form={form} schema={schema} id="email" />
            <kit.SchemaNode form={form} schema={schema} id="missing" />
          </Stack>
        </Form>
      )
    }
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    resetWarnings()
    render(<Harness />)
    expect(screen.getByLabelText('Email')).toHaveValue('me@example.com')
    expect(screen.queryByLabelText('Full name')).toBeNull()
    expect(screen.queryByRole('group', { name: 'You' })).toBeNull()
    expect(
      spy.mock.calls.some((call) => String(call[0]).includes('no node with id "missing"')),
    ).toBe(true)
    spy.mockRestore()
  })
})
