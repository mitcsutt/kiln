import { useId, type ReactNode } from 'react'
import { Form } from '#components'
import { kit } from '#kit'
import type { KitForm } from '#core/kit/types'
import { RevealErrors } from './RevealErrors'

type DefaultForm<T> = KitForm<T, undefined, typeof kit.registries.fields>

export interface FieldDemoProps<T> {
  /** Starting values — usually `{ value: … }` for a one-field demo. */
  defaultValues: T
  /** Submits once on mount so a field's own `validators` produce a visible error/warning
   * without a scripted interaction (see `RevealErrors`). */
  reveal?: boolean
  mode?: 'edit' | 'view'
  /** Accessible name for the `<form>` landmark. Default a unique "Example N" (several
   * `FieldDemo`s often sit on one "States" story — each needs its own name, or axe's
   * `landmark-unique` rightly flags them as indistinguishable). */
  label?: string
  children: (form: DefaultForm<T>) => ReactNode
}

/**
 * Story kit helper: the smallest possible live form for one field — used by every
 * field's "States" story, where each named state (error, warning, validating…) needs its own
 * isolated form instance so one doesn't bleed into another.
 */
export function FieldDemo<T>({
  defaultValues,
  reveal = false,
  mode,
  label,
  children,
}: FieldDemoProps<T>) {
  const form = kit.useAppForm<T>({ defaultValues })
  const autoId = useId()
  return (
    <Form form={form} aria-label={label ?? `Example ${autoId}`} mode={mode}>
      {children(form)}
      {reveal ? <RevealErrors /> : null}
    </Form>
  )
}
