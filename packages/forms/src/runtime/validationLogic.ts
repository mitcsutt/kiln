import {
  defaultValidationLogic,
  type AnyFormApi,
  type ValidationLogicFn,
  type ValidationLogicProps,
  type ValidationLogicValidatorsFn,
} from '@tanstack/react-form'
import { getFormRuntime, isInactive, type ValidateOn } from '#runtime/formRuntime'

export interface KitValidationLogicOptions {
  /** When `onDynamic` first runs. After a field's first blur (or any submit) it is always live. */
  validateOn?: ValidateOn
  /** An explicit TanStack logic (e.g. `revalidateLogic()`); inactive gating still wraps it. */
  base?: ValidationLogicFn
}

interface FieldMetaLike {
  isBlurred?: boolean
  errors?: readonly unknown[]
}

/** "Reward early, punish late": a field is live once blurred, or while it shows an error. */
function isFieldLive(form: AnyFormApi, name: string): boolean {
  const meta = form.getFieldMeta(name) as FieldMetaLike | undefined
  if (!meta) return false
  return meta.isBlurred === true || (meta.errors?.length ?? 0) > 0
}

interface DynamicMetaLike {
  errorMap?: { onDynamic?: unknown }
  errorSourceMap?: { onDynamic?: unknown }
}

/**
 * Whether the form-level `onDynamic` currently has an error up anywhere — a form message, or a
 * field error it routed (a refine on `confirm`). While one shows, it re-runs on any change, so a
 * fix in *another* field (password) clears the stale error as the user types (§13 #20). A
 * pristine, error-free form still never validates per keystroke (§12 rule 7).
 */
function formDynamicHasErrors(form: AnyFormApi): boolean {
  const state = form.state as {
    errorMap?: { onDynamic?: unknown }
    fieldMeta?: Record<string, DynamicMetaLike | undefined>
  }
  if (state.errorMap?.onDynamic) return true
  for (const meta of Object.values(state.fieldMeta ?? {})) {
    if (!meta?.errorMap?.onDynamic) continue
    // Only errors the form-level validator put there (TanStack records the source per slot).
    if (meta.errorSourceMap?.onDynamic === undefined || meta.errorSourceMap.onDynamic === 'form')
      return true
  }
  return false
}

function shouldRunDynamic(
  props: ValidationLogicProps,
  validateOn: ValidateOn,
  isFormLevel: boolean,
): boolean {
  const { form, event } = props
  switch (event.type) {
    case 'submit':
      return true
    case 'blur':
      return validateOn !== 'submit'
    case 'change': {
      if (validateOn === 'change') return true
      if (form.state.submissionAttempts > 0) return true
      if (getFormRuntime(form).forceDynamic) return true
      const name = isFormLevel ? getFormRuntime(form).changing : event.fieldName
      if (name && isFieldLive(form, name)) return true
      return isFormLevel && formDynamicHasErrors(form)
    }
    default:
      return false
  }
}

/**
 * The kit's `validationLogic` (§5.2): TanStack's standard slots unchanged; `onDynamic` runs on
 * submit always, on blur unless `validateOn: 'submit'`, and on change once the field is live (a
 * form-level one also while any of its errors is up); nothing runs for an inactive field's own
 * validators.
 */
export function kitValidationLogic({
  validateOn = 'blur',
  base,
}: KitValidationLogicOptions = {}): ValidationLogicFn {
  return (props) => {
    const { form, validators, event } = props
    // Form-level validators never receive a field name (TanStack 1.33 passes it for field validators only).
    const isFormLevel = event.fieldName === undefined || validators === form.options.validators
    if (!isFormLevel && event.fieldName && isInactive(getFormRuntime(form), event.fieldName)) {
      // TanStack types the logic as returning void, but it uses what runValidation returns.
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      return props.runValidation({ validators: [], form })
    }
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- as above
    if (base) return base(props)

    let collected: ValidationLogicValidatorsFn[] = []
    defaultValidationLogic({
      ...props,
      // Always present so the `onServer` slot is cleared on change even without validators.
      validators: validators ?? {},
      runValidation: (result) => {
        collected = result.validators.filter(
          (v): v is ValidationLogicValidatorsFn => v !== undefined,
        )
      },
    })
    // Server errors clear on the next *change* (or submit), not on blur (§4.2.7).
    if (event.type === 'blur') collected = collected.filter((v) => v.cause !== 'server')

    // TanStack types validator functions as `any`.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dynamic = event.async ? validators?.onDynamicAsync : validators?.onDynamic
    if (dynamic && shouldRunDynamic(props, validateOn, isFormLevel)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- as above
      collected.push({ fn: dynamic, cause: 'dynamic' })
    }
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- as above
    return props.runValidation({ validators: collected, form })
  }
}
