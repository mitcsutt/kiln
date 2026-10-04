import { useEffect, useState } from 'react'
import { act, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubmitButton } from '#components/SubmitButton'
import { FieldScope, useFieldScope } from '#core/scope/FieldScope'
import { useScopeErrors } from '#core/scope/useScopeErrors'
import { renderForm } from '#test/renderForm'

const required = ({ value }: { value: string }) => (value === '' ? 'Required' : undefined)

function Count({ label }: { label: string }) {
  const scope = useFieldScope()
  const count = useScopeErrors(scope)
  return <output aria-label={label}>{count}</output>
}

describe('FieldScope + useScopeErrors', () => {
  it('collects mounted names (remembered after unmount) and counts visible errors', async () => {
    let names: readonly string[] = []
    let hide: () => void = () => undefined
    function Toggle({ children }: { children: React.ReactNode }) {
      const [shown, setShown] = useState(true)
      useEffect(() => {
        hide = () => {
          setShown(false)
        }
      })
      return shown ? <>{children}</> : null
    }
    const { user } = renderForm(
      (f) => (
        <>
          <FieldScope onNamesChange={(n) => (names = n)}>
            <Toggle>
              <f.TextField name="street" label="Street" validators={{ onDynamic: required }} />
            </Toggle>
            <f.TextField name="city" label="City" validators={{ onDynamic: required }} />
            <Count label="Address errors" />
          </FieldScope>
          <FieldScope names={['notes']}>
            <f.TextField name="notes" label="Notes" />
            <Count label="Notes errors" />
          </FieldScope>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { street: '', city: '', notes: '' } },
    )
    expect(names).toEqual(['street', 'city'])
    expect(screen.getByRole('status', { name: 'Address errors' })).toHaveTextContent('0')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('status', { name: 'Address errors' })).toHaveTextContent('2')
    expect(screen.getByRole('status', { name: 'Notes errors' })).toHaveTextContent('0')
    act(() => {
      hide()
    })
    expect(names).toEqual(['street', 'city'])
  })
})
