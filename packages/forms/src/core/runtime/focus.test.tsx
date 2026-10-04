import { useState } from 'react'
import { act, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubmitButton } from '#components/SubmitButton'
import { FieldScope } from '#core/scope/FieldScope'
import { focusField, focusFirstInvalid } from '#core/runtime/focus'
import { renderForm } from '#test/renderForm'

const required = ({ value }: { value: string }) => (value === '' ? 'Required' : undefined)

describe('focus (§5.6)', () => {
  it('focuses the first invalid field in DOM order, not registration order', async () => {
    let reveal: () => void = () => undefined
    function Late({ children }: { children: React.ReactNode }) {
      const [shown, setShown] = useState(false)
      reveal = () => {
        setShown(true)
      }
      return shown ? <>{children}</> : null
    }
    const { user } = renderForm(
      (f) => (
        <>
          <Late>
            <f.TextField name="first" label="First" validators={{ onDynamic: required }} />
          </Late>
          <f.TextField name="second" label="Second" validators={{ onDynamic: required }} />
          <SubmitButton>Go</SubmitButton>
        </>
      ),
      { defaultValues: { first: '', second: '' } },
    )
    act(() => {
      reveal()
    })
    await user.click(screen.getByRole('button', { name: 'Go' }))
    await waitFor(() => expect(screen.getByLabelText('First')).toHaveFocus())
  })

  it('reveals the scope chain (outermost first) before focusing', async () => {
    const calls: string[] = []
    const { form } = renderForm(
      (f) => (
        <FieldScope reveal={() => calls.push('tab')}>
          <FieldScope reveal={() => calls.push('accordion')}>
            <f.TextField name="city" label="City" />
          </FieldScope>
        </FieldScope>
      ),
      { defaultValues: { city: '' } },
    )
    await expect(focusField(form, 'city')).resolves.toBe(true)
    expect(calls).toEqual(['tab', 'accordion'])
    expect(screen.getByLabelText('City')).toHaveFocus()
    await expect(focusField(form, 'nope')).resolves.toBe(false)
  })

  it('focusFirstInvalid resolves false when nothing is invalid', async () => {
    const { form } = renderForm((f) => <f.TextField name="city" label="City" />, {
      defaultValues: { city: 'Leeds' },
    })
    await expect(focusFirstInvalid(form)).resolves.toBe(false)
  })

  it('focusOnInvalid: false leaves focus alone', async () => {
    const { user } = renderForm(
      (f) => (
        <>
          <f.TextField name="name" label="Name" validators={{ onDynamic: required }} />
          <SubmitButton>Go</SubmitButton>
        </>
      ),
      { defaultValues: { name: '' }, focusOnInvalid: false },
    )
    await user.click(screen.getByRole('button', { name: 'Go' }))
    await screen.findByText('Required')
    expect(screen.getByRole('button', { name: 'Go' })).toHaveFocus()
  })
})
