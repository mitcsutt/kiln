import { memo } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorSummary } from '#components/form/ErrorSummary'
import { SubmitButton } from '#components/form/SubmitButton'
import type { kit } from '#kit/defaultKit'
import { countRenders, RenderCounter, resetRenderCounts } from '#test/perf'
import { renderForm } from '#test/renderForm'

type Form = ReturnType<typeof kit.useAppForm<Record<string, string>>>
const names = Array.from({ length: 20 }, (_, i) => `field${String(i)}`)

const Fields = memo(function Fields({ form }: { form: Form }) {
  return (
    <>
      {names.map((name) => (
        <RenderCounter key={name} id={name}>
          <form.TextField name={name as never} label={`Field ${name}`} />
        </RenderCounter>
      ))}
    </>
  )
})

describe('performance (§12)', () => {
  it('typing into one field re-renders only that field', async () => {
    const { user } = renderForm(
      (f) => (
        <RenderCounter id="host">
          <ErrorSummary />
          <Fields form={f as unknown as Form} />
          <SubmitButton>Save</SubmitButton>
        </RenderCounter>
      ),
      { defaultValues: Object.fromEntries(names.map((n) => [n, ''])) },
    )
    resetRenderCounts()
    await user.type(screen.getByLabelText('Field field3'), 'abcdefghij')
    expect(countRenders('field3')).toBe(10)
    const others = names.filter((name) => name !== 'field3')
    expect(others.map((name) => countRenders(name))).toEqual(others.map(() => 0))
  })
})
