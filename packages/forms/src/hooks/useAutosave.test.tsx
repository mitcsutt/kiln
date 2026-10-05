import { useEffect } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { Form } from '#components/form/Form'
import { FormStatus } from '#components/form/FormStatus'
import { useAutosave } from '#hooks/useAutosave'
import { kit } from '#kit/defaultKit'

let api: ReturnType<typeof kit.useAppForm<{ note: string }>> | null = null

function Notes({
  save,
  onlyWhenValid,
}: {
  save: (v: { note: string }, ctx: { signal: AbortSignal }) => Promise<unknown>
  onlyWhenValid?: boolean
}) {
  const form = kit.useAppForm({
    defaultValues: { note: '' },
    validators: {
      onChange: ({ value }) =>
        value.note === 'bad' ? { fields: { note: 'Not allowed' } } : undefined,
    },
  })
  useEffect(() => {
    api = form
  })
  const state = useAutosave(form, save, { debounceMs: 500, onlyWhenValid })
  return (
    <Form form={form} aria-label="Notes">
      <form.TextField name="note" label="Note" />
      <FormStatus />
      <output aria-label="Autosave">{state.status}</output>
    </Form>
  )
}

const set = (value: string) => {
  act(() => api?.setFieldValue('note', value))
}

describe('useAutosave', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('debounces, saves dirty values, rebaselines and reports status', async () => {
    const save = vi.fn(() => Promise.resolve())
    render(<Notes save={save} />)
    set('a')
    set('ab')
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Unsaved changes')
    await act(() => {
      vi.advanceTimersByTime(499)
      return Promise.resolve()
    })
    expect(save).not.toHaveBeenCalled()
    await act(() => {
      vi.advanceTimersByTime(1)
      return Promise.resolve()
    })
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith(
      { note: 'ab' },
      expect.objectContaining({ signal: expect.any(AbortSignal) as unknown }),
    )
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByRole('status', { name: 'Autosave' })).toHaveTextContent('saved')
    expect(api?.state.isDefaultValue).toBe(true)
  })

  it('skips invalid values and aborts a superseded save', async () => {
    const signals: AbortSignal[] = []
    const save = vi.fn((_: { note: string }, { signal }: { signal: AbortSignal }) => {
      signals.push(signal)
      return new Promise(() => undefined)
    })
    render(<Notes save={save} />)
    set('bad')
    await act(() => {
      vi.advanceTimersByTime(600)
      return Promise.resolve()
    })
    expect(save).not.toHaveBeenCalled()
    set('good')
    await act(() => {
      vi.advanceTimersByTime(600)
      return Promise.resolve()
    })
    set('better')
    await act(() => {
      vi.advanceTimersByTime(600)
      return Promise.resolve()
    })
    expect(save).toHaveBeenCalledTimes(2)
    expect(signals[0]?.aborted).toBe(true)
    expect(screen.getByRole('status', { name: 'Autosave' })).toHaveTextContent('saving')
  })

  it('reports errors', async () => {
    const save = vi.fn(() => Promise.reject(new Error('offline')))
    render(<Notes save={save} />)
    set('a')
    await act(() => {
      vi.advanceTimersByTime(500)
      return Promise.resolve()
    })
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByRole('status', { name: 'Autosave' })).toHaveTextContent('error')
  })

  describe('onlyWhenValid validates before saving under the default validateOn', () => {
    let contact: ReturnType<typeof kit.useAppForm<{ email: string }>> | null = null

    function Contact({ save, fieldRule }: { save: () => Promise<unknown>; fieldRule?: boolean }) {
      // Default `validateOn: 'blur'`: neither the form schema nor a field `onDynamic` runs on change before a blur.
      const form = kit.useAppForm({
        defaultValues: { email: '' },
        ...(fieldRule ? {} : { schema: z.object({ email: z.email('Enter an email address') }) }),
      })
      useEffect(() => {
        contact = form
      })
      useAutosave(form, save, { debounceMs: 500 })
      const onDynamic = ({ value }: { value: string }) =>
        value.includes('@') ? undefined : 'Enter an email address'
      return (
        <Form form={form} aria-label="Contact">
          <form.TextField
            name="email"
            label="Email"
            validators={fieldRule ? { onDynamic } : undefined}
          />
        </Form>
      )
    }

    const typeInto = (value: string) =>
      fireEvent.change(screen.getByLabelText('Email'), { target: { value } })
    const settle = async (ms: number) => {
      await act(() => {
        vi.advanceTimersByTime(ms)
        return Promise.resolve()
      })
      for (let i = 0; i < 5; i += 1) {
        await act(async () => {
          await Promise.resolve()
        })
      }
    }

    it.each([
      ['a form schema', false],
      ['a field onDynamic validator', true],
    ])(
      'does not save an invalid edit caught only by %s, and saves once it is fixed',
      async (_name, fieldRule) => {
        const save = vi.fn(() => Promise.resolve())
        render(<Contact save={save} fieldRule={fieldRule} />)
        typeInto('ada')
        await settle(600)
        expect(save).not.toHaveBeenCalled()
        // The error is recorded but stays hidden: visibility is the form's policy (never blurred).
        expect(screen.queryByText('Enter an email address')).toBeNull()
        typeInto('ada@example.com')
        await settle(600)
        expect(save).toHaveBeenCalledTimes(1)
        expect(contact?.state.values.email).toBe('ada@example.com')
      },
    )
  })
})
