import { describe, expect, it } from 'vitest'
import type { AnyFormApi, ValidationLogicProps } from '@tanstack/react-form'
import { getFormRuntime, markInactive, type ValidateOn } from '#core/runtime/formRuntime'
import { kitValidationLogic } from '#core/runtime/validationLogic'

type Stage = 'before blur' | 'after blur' | 'after submit'
type Level = 'field' | 'form'
type EventType = 'blur' | 'change' | 'submit'

const fieldValidators = { onDynamic: () => 'field', onChange: () => 'change', onBlur: () => 'blur' }
const formValidators = { onDynamic: () => 'form' }

function makeForm(stage: Stage) {
  const meta = { isBlurred: stage !== 'before blur', errors: [] as unknown[] }
  const form = {
    state: { submissionAttempts: stage === 'after submit' ? 1 : 0, fieldMeta: {} },
    options: { validators: formValidators },
    getFieldMeta: () => meta,
    setFieldMeta: () => undefined,
  }
  return { form: form as unknown as AnyFormApi, meta }
}

function causes(
  level: Level,
  type: EventType,
  stage: Stage,
  validateOn: ValidateOn = 'blur',
): string[] {
  const { form } = makeForm(stage)
  if (level === 'form') getFormRuntime(form).changing = 'name'
  let collected: string[] = []
  const props = {
    form,
    validators: level === 'field' ? fieldValidators : formValidators,
    event: { type, fieldName: level === 'field' ? 'name' : undefined, async: false },
    runValidation: ({ validators }: { validators: ({ cause: string } | undefined)[] }) => {
      collected = validators
        .filter((v): v is { cause: string } => v !== undefined)
        .map((v) => v.cause)
    },
  } as unknown as ValidationLogicProps
  kitValidationLogic({ validateOn })(props)
  return collected
}

const runsDynamic = (level: Level, type: EventType, stage: Stage, validateOn?: ValidateOn) =>
  causes(level, type, stage, validateOn).includes('dynamic')

describe('kitValidationLogic: onDynamic matrix (validateOn: blur)', () => {
  // [event, stage] → runs?  Same answer for field- and form-level validators.
  const matrix: [EventType, Stage, boolean][] = [
    ['change', 'before blur', false],
    ['change', 'after blur', true],
    ['change', 'after submit', true],
    ['blur', 'before blur', true],
    ['blur', 'after blur', true],
    ['blur', 'after submit', true],
    ['submit', 'before blur', true],
    ['submit', 'after blur', true],
    ['submit', 'after submit', true],
  ]
  for (const level of ['field', 'form'] as const) {
    for (const [type, stage, expected] of matrix) {
      it(`${level}: ${type} ${stage} → ${expected ? 'runs' : 'skips'}`, () => {
        expect(runsDynamic(level, type, stage)).toBe(expected)
      })
    }
  }
})

describe('kitValidationLogic: other modes', () => {
  it("validateOn 'change' runs on the first keystroke", () => {
    expect(runsDynamic('field', 'change', 'before blur', 'change')).toBe(true)
    expect(runsDynamic('form', 'change', 'before blur', 'change')).toBe(true)
  })

  it("validateOn 'submit' skips blur until the field is live, then runs on change", () => {
    expect(runsDynamic('field', 'blur', 'before blur', 'submit')).toBe(false)
    expect(runsDynamic('field', 'blur', 'after blur', 'submit')).toBe(false)
    expect(runsDynamic('field', 'submit', 'before blur', 'submit')).toBe(true)
    expect(runsDynamic('field', 'change', 'after submit', 'submit')).toBe(true)
  })

  it('a field that currently shows an error re-validates on change', () => {
    const { form, meta } = makeForm('before blur')
    meta.errors = ['Required']
    let ran = false
    kitValidationLogic()({
      form,
      validators: fieldValidators,
      event: { type: 'change', fieldName: 'name', async: false },
      runValidation: ({ validators }: { validators: ({ cause: string } | undefined)[] }) => {
        ran = validators.some((v) => v?.cause === 'dynamic')
      },
    } as unknown as ValidationLogicProps)
    expect(ran).toBe(true)
  })

  it('keeps the standard slots and clears server errors on change, not on blur', () => {
    expect(causes('field', 'change', 'before blur')).toEqual(['change', 'server'])
    expect(causes('field', 'blur', 'before blur')).toEqual(['blur', 'dynamic'])
  })

  it('runs nothing for an inactive field (its own validators)', () => {
    const { form } = makeForm('after submit')
    markInactive(form, ['name'], 'disabled', 'keep')
    let collected: unknown[] = ['sentinel']
    kitValidationLogic()({
      form,
      validators: fieldValidators,
      event: { type: 'submit', fieldName: 'name', async: false },
      runValidation: ({ validators }: { validators: unknown[] }) => {
        collected = validators
      },
    } as unknown as ValidationLogicProps)
    expect(collected).toEqual([])
  })
})

describe('kitValidationLogic: form-level onDynamic while its errors are up (§13 #20)', () => {
  function runs(level: Level, fieldMeta: Record<string, unknown>, formError?: string): boolean {
    const { form } = makeForm('before blur')
    ;(form.state as unknown as { fieldMeta: Record<string, unknown> }).fieldMeta = fieldMeta
    if (formError !== undefined)
      (form.state as unknown as { errorMap: unknown }).errorMap = { onDynamic: formError }
    if (level === 'form') getFormRuntime(form).changing = 'name'
    let ran = false
    kitValidationLogic()({
      form,
      validators: level === 'field' ? fieldValidators : formValidators,
      event: { type: 'change', fieldName: level === 'field' ? 'name' : undefined, async: false },
      runValidation: ({ validators }: { validators: ({ cause: string } | undefined)[] }) => {
        ran = validators.some((v) => v?.cause === 'dynamic')
      },
    } as unknown as ValidationLogicProps)
    return ran
  }
  const routed = {
    confirm: {
      errorMap: { onDynamic: 'Passwords don’t match' },
      errorSourceMap: { onDynamic: 'form' },
    },
  }

  it('re-runs on a change in a never-blurred field while it has routed an error to another field', () => {
    expect(runs('form', routed)).toBe(true)
  })
  it('re-runs while a form-level message is up', () => {
    expect(runs('form', {}, 'Something is off')).toBe(true)
  })
  it('stays off for a pristine, error-free form, and for a field-level error from the field itself', () => {
    expect(runs('form', {})).toBe(false)
    expect(
      runs('form', {
        confirm: { errorMap: { onDynamic: 'x' }, errorSourceMap: { onDynamic: 'field' } },
      }),
    ).toBe(false)
  })
  it('does not change the field-level predicate', () => {
    expect(runs('field', routed)).toBe(false)
  })
})
